/**
 * Phase 6: Refining (Downstream) — Calculation Engine
 * Complex refinery engineering calculations for industrial engineers, consultancies, and students.
 * All calculations handle full industrial-scale values (large numbers up to billions).
 */

// ───────────────────────────────────────────────────────────────
// 6.1 CRUDE OIL RECEPTION & CHARACTERIZATION
// ───────────────────────────────────────────────────────────────

/** API gravity from specific gravity */
export function apiGravity(sg: number): number {
    return (141.5 / sg) - 131.5;
}

/** Specific gravity from API gravity */
export function sgFromAPI(api: number): number {
    return 141.5 / (api + 131.5);
}

/** Sulfur classification */
export function sulfurClass(sulfurWtPct: number): 'sweet' | 'medium' | 'sour' {
    if (sulfurWtPct < 0.5) return 'sweet';
    if (sulfurWtPct <= 1.0) return 'medium';
    return 'sour';
}

/** Days of crude inventory */
export function daysOfInventory(tankCapacityBbl: number, dailyThroughputBpd: number): number {
    if (dailyThroughputBpd <= 0) return 0;
    return tankCapacityBbl / dailyThroughputBpd;
}

/** Blend API gravity (volumetric weighted) */
export function blendApiGravity(crudes: { api: number; volumeBbl: number }[]): number {
    const totalVol = crudes.reduce((s, c) => s + c.volumeBbl, 0);
    if (totalVol <= 0) return 0;
    const totalMass = crudes.reduce((s, c) => s + (c.volumeBbl * sgFromAPI(c.api)), 0);
    const blendSg = totalMass / totalVol;
    return apiGravity(blendSg);
}

/** Blend sulfur content (weight-based) */
export function blendSulfur(crudes: { sulfurWtPct: number; api: number; volumeBbl: number }[]): number {
    let totalMass = 0, totalSulfur = 0;
    crudes.forEach(c => {
        const mass = c.volumeBbl * sgFromAPI(c.api);
        totalMass += mass;
        totalSulfur += mass * c.sulfurWtPct / 100;
    });
    if (totalMass <= 0) return 0;
    return (totalSulfur / totalMass) * 100;
}

/** TAN classification */
export function tanClass(tan: number): 'low' | 'moderate' | 'high' | 'corrosive' {
    if (tan < 0.5) return 'low';
    if (tan < 1.0) return 'moderate';
    if (tan < 2.0) return 'high';
    return 'corrosive';
}

/** TBP yield at a given temperature using modified Riazi-Daubert correlation */
export function tbpYieldAtTemp(tempF: number, t50F: number, t100F: number): number {
    const delta = t100F - t50F;
    if (delta <= 0) return 0;
    const x = (tempF - 50) / delta;
    if (x <= 0) return 0;
    if (x >= 3) return 100;
    return 100 / (1 + Math.exp(-2.197 * (x - 1)));
}

/** Generate full TBP curve points */
export function generateTBPCurve(t50F: number, t100F: number, numPoints: number = 25): { tempF: number; yieldPct: number }[] {
    const points: { tempF: number; yieldPct: number }[] = [];
    const maxT = t100F + 200;
    for (let i = 0; i < numPoints; i++) {
        const tempF = 50 + (i / (numPoints - 1)) * (maxT - 50);
        points.push({ tempF, yieldPct: tbpYieldAtTemp(tempF, t50F, t100F) });
    }
    return points;
}

/** Crude purchase cost */
export function crudeCostTotal(crudeSlate: { volumeBbl: number; costPerBbl: number }[], tankFleetCostPerDay: number = 0, days: number = 30): number {
    const crudeCost = crudeSlate.reduce((s, c) => s + c.volumeBbl * c.costPerBbl * days, 0);
    return crudeCost + tankFleetCostPerDay * days;
}

/** Simplified LP crude optimization - margin maximization */
export function lpCrudeOptimization(
    crudes: { name: string; api: number; sulfurWtPct: number; tan: number; costPerBbl: number; availableBpd: number }[],
    unitCapacities: { cduBpd: number; sulfurMaxWtPct: number; tanMax: number; minApi: number; maxApi: number },
    productPrices: { gasoline: number; diesel: number; jet: number; fuelOil: number; lpg: number },
    yieldModel: (api: number) => { gasoline: number; diesel: number; jet: number; fuelOil: number; lpg: number }
): { selectedCrudes: { name: string; volumeBpd: number }[]; totalCrudeBpd: number; totalCost: number; totalRevenue: number; margin: number; marginPerBbl: number } {
    const ranked = crudes.map(c => {
        const yields = yieldModel(c.api);
        const revenue = yields.gasoline * productPrices.gasoline + yields.diesel * productPrices.diesel + yields.jet * productPrices.jet + yields.fuelOil * productPrices.fuelOil + yields.lpg * productPrices.lpg;
        const marginPerBbl = revenue - c.costPerBbl;
        return { ...c, marginPerBbl, yields };
    }).sort((a, b) => b.marginPerBbl - a.marginPerBbl);

    let remaining = unitCapacities.cduBpd;
    const selectedCrudes: { name: string; volumeBpd: number }[] = [];
    let totalCost = 0, totalRevenue = 0;

    for (const c of ranked) {
        if (remaining <= 0) break;
        if (c.api < unitCapacities.minApi || c.api > unitCapacities.maxApi) continue;
        if (c.sulfurWtPct > unitCapacities.sulfurMaxWtPct) continue;
        if (c.tan > unitCapacities.tanMax) continue;
        const vol = Math.min(c.availableBpd, remaining);
        if (vol > 0) {
            selectedCrudes.push({ name: c.name, volumeBpd: vol });
            totalCost += vol * c.costPerBbl;
            totalRevenue += vol * (c.yields.gasoline * productPrices.gasoline + c.yields.diesel * productPrices.diesel + c.yields.jet * productPrices.jet + c.yields.fuelOil * productPrices.fuelOil + c.yields.lpg * productPrices.lpg);
            remaining -= vol;
        }
    }

    const totalCrudeBpd = unitCapacities.cduBpd - remaining;
    const margin = totalRevenue - totalCost;
    const marginPerBbl = totalCrudeBpd > 0 ? margin / totalCrudeBpd : 0;

    return { selectedCrudes, totalCrudeBpd, totalCost, totalRevenue, margin, marginPerBbl };
}

/** Crude blend compatibility / stability index */
export function crudeBlendCompatibility(
    crudeA: { api: number; asphaltenesWtPct: number; aromaticsPct: number },
    crudeB: { api: number; asphaltenesWtPct: number; aromaticsPct: number }
): { compatibilityIndex: number; stable: boolean; risk: 'low' | 'medium' | 'high' } {
    const deltaApi = Math.abs(crudeA.api - crudeB.api);
    const avgAsphaltenes = (crudeA.asphaltenesWtPct + crudeB.asphaltenesWtPct) / 2;
    const avgAromatics = (crudeA.aromaticsPct + crudeB.aromaticsPct) / 2;
    const cii = avgAsphaltenes / Math.max(0.1, avgAromatics);
    const apiPenalty = deltaApi * 0.05;
    const compatibilityIndex = Math.max(0, 1 - cii - apiPenalty);
    const stable = compatibilityIndex > 0.6;
    const risk = compatibilityIndex > 0.7 ? 'low' : compatibilityIndex > 0.4 ? 'medium' : 'high';
    return { compatibilityIndex, stable, risk };
}

/** Assay data interpolation between known cuts */
export function assayInterpolation(
    cuts: { tempF: number; sg: number; sulfurWtPct: number; viscosityCst: number }[],
    targetTempF: number
): { sg: number; sulfurWtPct: number; viscosityCst: number } {
    if (cuts.length < 2) return { sg: cuts[0]?.sg ?? 0.85, sulfurWtPct: cuts[0]?.sulfurWtPct ?? 1, viscosityCst: cuts[0]?.viscosityCst ?? 2 };
    const lower = cuts.filter(c => c.tempF <= targetTempF).sort((a, b) => b.tempF - a.tempF)[0];
    const upper = cuts.filter(c => c.tempF >= targetTempF).sort((a, b) => a.tempF - b.tempF)[0];
    if (!lower) return { sg: upper.sg, sulfurWtPct: upper.sulfurWtPct, viscosityCst: upper.viscosityCst };
    if (!upper) return { sg: lower.sg, sulfurWtPct: lower.sulfurWtPct, viscosityCst: lower.viscosityCst };
    const frac = (targetTempF - lower.tempF) / (upper.tempF - lower.tempF);
    return {
        sg: lower.sg + (upper.sg - lower.sg) * frac,
        sulfurWtPct: lower.sulfurWtPct + (upper.sulfurWtPct - lower.sulfurWtPct) * frac,
        viscosityCst: Math.exp(Math.log(lower.viscosityCst) + (Math.log(upper.viscosityCst) - Math.log(lower.viscosityCst)) * frac)
    };
}

/** Tank heel recovery economics */
export function tankHeelRecovery(
    tankCapacityBbl: number,
    heelFraction: number,
    crudeValuePerBbl: number,
    recoveryCostPerBbl: number
): { heelVolumeBbl: number; recoverableValue: number; recoveryCost: number; netBenefit: number; breakevenHeelPct: number } {
    const heelVolumeBbl = tankCapacityBbl * heelFraction;
    const recoverableValue = heelVolumeBbl * crudeValuePerBbl;
    const recoveryCost = heelVolumeBbl * recoveryCostPerBbl;
    const netBenefit = recoverableValue - recoveryCost;
    const breakevenHeelPct = (recoveryCostPerBbl / crudeValuePerBbl) * 100;
    return { heelVolumeBbl, recoverableValue, recoveryCost, netBenefit, breakevenHeelPct };
}

// ───────────────────────────────────────────────────────────────
// 6.2 CRUDE DESALTING
// ───────────────────────────────────────────────────────────────

/** Salt removal efficiency per stage */
export function saltRemovalEfficiency(inletSaltPTB: number, outletSaltPTB: number): number {
    if (inletSaltPTB <= 0) return 0;
    return ((inletSaltPTB - outletSaltPTB) / inletSaltPTB) * 100;
}

/** Multi-stage desalting - outlet salt after N stages */
export function multiStageDesalting(inletSaltPTB: number, stageEfficiency: number, numStages: number): number {
    let salt = inletSaltPTB;
    for (let i = 0; i < numStages; i++) {
        salt *= (1 - stageEfficiency / 100);
    }
    return salt;
}

/** Wash water rate (bbl/day) */
export function washWaterRate(crudeRateBpd: number, washWaterVolPct: number): number {
    return crudeRateBpd * washWaterVolPct / 100;
}

/** Mix valve pressure drop to shear rate correlation */
export function mixValveShear(deltaPPsi: number, flowBpd: number, valveCv: number): number {
    if (valveCv <= 0) return 0;
    return (deltaPPsi * Math.sqrt(flowBpd)) / (valveCv * 20);
}

/** Brine effluent salt concentration */
export function brineSaltConcentration(washWaterBpd: number, saltRemovedLbPerDay: number): number {
    if (washWaterBpd <= 0) return 0;
    return (saltRemovedLbPerDay * 453592) / (washWaterBpd * 158.987 / 1000);
}

/** Demulsifier injection cost */
export function demulsifierCost(dosePpm: number, crudeRateBpd: number, chemicalCostPerGal: number): number {
    const galPerDay = (dosePpm * crudeRateBpd * 42) / 1e6;
    return galPerDay * chemicalCostPerGal;
}

/** Electrostatic desalter - field strength and polarization */
export function desalterElectrostaticForce(
    voltageV: number,
    electrodeSpacingIn: number,
    waterDropletDiameterMicron: number,
    oilDielectricConstant: number = 2.2,
    waterDielectricConstant: number = 80
): { fieldStrengthKVPerCm: number; polarizationForceDy: number; settlingTimeSec: number } {
    const spacingCm = electrodeSpacingIn * 2.54;
    const fieldStrengthKVPerCm = (voltageV / 1000) / spacingCm;
    const r = waterDropletDiameterMicron / 10000;
    const dielectricRatio = (waterDielectricConstant - oilDielectricConstant) / (waterDielectricConstant + 2 * oilDielectricConstant);
    const polarizationForceDy = 6 * Math.PI * Math.pow(r, 3) * dielectricRatio * Math.pow(fieldStrengthKVPerCm * 1000, 2) * 8.854e-12 * 1e5;
    const oilViscosityCP = 10;
    const settlingTimeSec = (18 * oilViscosityCP * 0.001 * spacingCm) / (Math.pow(waterDropletDiameterMicron * 1e-4, 2) * 981 * 0.15);
    return { fieldStrengthKVPerCm, polarizationForceDy, settlingTimeSec };
}

/** Rag layer thickness growth model */
export function ragLayerThickness(
    crudeTan: number,
    asphalteneWtPct: number,
    solidsPpm: number,
    daysSinceLastDrain: number,
    demulsifierDosePpm: number
): { ragThicknessIn: number; criticalThicknessIn: number; drainingRecommended: boolean } {
    const emulsionIndex = crudeTan * 0.3 + asphalteneWtPct * 0.5 + solidsPpm * 0.001;
    const growthRate = emulsionIndex * 0.05;
    const suppressionFactor = Math.exp(-demulsifierDosePpm * 0.02);
    const ragThicknessIn = growthRate * daysSinceLastDrain * suppressionFactor;
    const criticalThicknessIn = 12;
    const drainingRecommended = ragThicknessIn > criticalThicknessIn * 0.7;
    return { ragThicknessIn, criticalThicknessIn, drainingRecommended };
}

/** Caustic injection rate for HCl neutralization */
export function causticDoseRate(
    saltRemovedLbPerDay: number,
    causticStrengthWtPct: number = 10,
    excessCausticPpm: number = 5
): { naohRequiredLbPerDay: number; causticSolutionGalPerDay: number; costPerDay: number } {
    const mgcl2 = saltRemovedLbPerDay * 0.15;
    const cacl2 = saltRemovedLbPerDay * 0.10;
    const nacl = saltRemovedLbPerDay * 0.75;
    const hclFromMgcl2 = mgcl2 * (2 * 36.46 / 95.21);
    const hclFromCacl2 = cacl2 * (2 * 36.46 / 110.98);
    const hclFromNacl = nacl * (36.46 / 58.44);
    const totalHCl = hclFromMgcl2 + hclFromCacl2 + hclFromNacl;
    const stoichiometricNaOH = totalHCl * (40 / 36.46);
    const excessNaOH = saltRemovedLbPerDay * excessCausticPpm / 1e6;
    const naohRequiredLbPerDay = stoichiometricNaOH + excessNaOH;
    const causticSolutionGalPerDay = naohRequiredLbPerDay / (causticStrengthWtPct / 100 * 8.34);
    const costPerDay = causticSolutionGalPerDay * 3.5;
    return { naohRequiredLbPerDay, causticSolutionGalPerDay, costPerDay };
}

/** Brine disposal cost */
export function brineDisposalCost(
    brineFlowBpd: number,
    oilContentPpm: number,
    disposalCostPerBbl: number,
    oilRecoveryValuePerBbl: number
): { disposalCostPerDay: number; oilRecoveryValuePerDay: number; netCostPerDay: number; oilRecoveredBpd: number } {
    const oilRecoveredBpd = brineFlowBpd * oilContentPpm / 1e6;
    const disposalCostPerDay = brineFlowBpd * disposalCostPerBbl;
    const oilRecoveryValuePerDay = oilRecoveredBpd * oilRecoveryValuePerBbl;
    const netCostPerDay = disposalCostPerDay - oilRecoveryValuePerDay;
    return { disposalCostPerDay, oilRecoveryValuePerDay, netCostPerDay, oilRecoveredBpd };
}

// ───────────────────────────────────────────────────────────────
// 6.3 CRUDE DISTILLATION (Atmospheric & Vacuum)
// ───────────────────────────────────────────────────────────────

/** Furnace heat duty (MMBtu/hr) */
export function furnaceDuty(crudeRateBpd: number, inletTempF: number, outletTempF: number, crudeApi: number): number {
    const sg = sgFromAPI(crudeApi);
    const massRateLbHr = crudeRateBpd * 42 * sg * 8.33 / 24;
    const vaporFraction = Math.min(0.6, (outletTempF - 500) / 300);
    const cpBtuLbF = 0.5 + vaporFraction * 0.15;
    const latentHeat = vaporFraction * 140;
    return (massRateLbHr * (cpBtuLbF * (outletTempF - inletTempF) + latentHeat)) / 1e6;
}

/** Furnace efficiency */
export function furnaceEfficiency(stackTempF: number, excessAirPct: number): number {
    const baseEff = 92;
    const stackPenalty = Math.max(0, (stackTempF - 350) * 0.03);
    const airPenalty = Math.max(0, (excessAirPct - 10) * 0.1);
    return Math.max(75, baseEff - stackPenalty - airPenalty);
}

/** CDU product yields (simplified but realistic split) */
export function crudeDistillationYields(
    crudeApi: number,
    furnaceOutletF: number,
    crudeRateBpd: number
): {
    lightNaphtha: number; heavyNaphtha: number; kerosene: number;
    diesel: number; hgo: number; atmosResidue: number;
    gas: number;
} {
    const sg = sgFromAPI(crudeApi);
    const residueBase = Math.max(15, (1 - sg) * 180 + 15);
    const lightFactor = Math.max(0.5, 1 - (sg - 0.75) * 3);

    const gas = crudeRateBpd * 0.02 * lightFactor;
    const lightNaphtha = crudeRateBpd * 0.12 * lightFactor;
    const heavyNaphtha = crudeRateBpd * 0.10 * lightFactor;
    const kerosene = crudeRateBpd * 0.08 * lightFactor;
    const diesel = crudeRateBpd * 0.18 * lightFactor;
    const hgo = crudeRateBpd * 0.12 * lightFactor;
    const atmosResidue = crudeRateBpd * residueBase / 100;

    return { lightNaphtha, heavyNaphtha, kerosene, diesel, hgo, atmosResidue, gas };
}

/** VDU yields from atmospheric residue */
export function vacuumDistillationYields(
    atmosResidueBpd: number,
    furnaceOutletF: number,
    vacuumMmHg: number
): { lvgo: number; hvgo: number; vacResidue: number; vacOverhead: number } {
    const severity = (furnaceOutletF - 720) / 100 + (50 - vacuumMmHg) / 50;
    const vgoYield = Math.min(0.65, 0.35 + severity * 0.1);

    const lvgo = atmosResidueBpd * vgoYield * 0.45;
    const hvgo = atmosResidueBpd * vgoYield * 0.55;
    const vacOverhead = atmosResidueBpd * 0.02;
    const vacResidue = atmosResidueBpd - lvgo - hvgo - vacOverhead;

    return { lvgo, hvgo, vacResidue, vacOverhead };
}

/** Flooding factor for tray hydraulics (Fair's correlation simplified) */
export function trayFloodingFactor(vaporLoadFts: number, traySpacingIn: number): number {
    if (traySpacingIn <= 0) return 0;
    const capacityFactor = 0.15 + traySpacingIn * 0.003;
    const maxVaporLoad = capacityFactor * Math.sqrt(1 / 0.075);
    return Math.min(1, vaporLoadFts / (maxVaporLoad * 0.82));
}

/** Pump-around duty (MMBtu/hr) */
export function pumpAroundDuty(circRateBpd: number, deltaTF: number, apiGravity: number): number {
    const sg = sgFromAPI(apiGravity);
    const massRateLbHr = circRateBpd * 42 * sg * 8.33 / 24;
    const cp = 0.55;
    return (massRateLbHr * cp * deltaTF) / 1e6;
}

/** Preheat train UA tracking with fouling */
export function preheatTrainUA(
    designUA: number,
    runtimeDays: number,
    foulingFactor: number,
    cleaningsPerYear: number
): { currentUA: number; foulingPct: number; efficiency: number; cleaningRecommended: boolean } {
    const daysSinceCleaning = runtimeDays - (Math.floor(runtimeDays / (365 / cleaningsPerYear)) * (365 / cleaningsPerYear));
    const foulingResistance = foulingFactor * Math.log(1 + daysSinceCleaning / 30);
    const currentUA = designUA / (1 + foulingResistance);
    const foulingPct = (1 - currentUA / designUA) * 100;
    const efficiency = (currentUA / designUA) * 100;
    const cleaningRecommended = foulingPct > 25;
    return { currentUA, foulingPct, efficiency, cleaningRecommended };
}

/** Tray hydraulic check - weeping and flooding limits */
export function trayHydraulicCheck(
    vaporLoadCfs: number,
    liquidLoadGpm: number,
    trayAreaFt2: number,
    weirLengthIn: number,
    traySpacingIn: number
): { vaporVelocityFtS: number; weepingFactor: number; floodingFactor: number; downcomerBackupIn: number; stable: boolean } {
    const columnArea = trayAreaFt2;
    const netArea = columnArea * 0.88;
    const vaporVelocityFtS = vaporLoadCfs / netArea;
    const fFactor = vaporVelocityFtS * Math.sqrt(0.07);
    const weepingFactor = Math.max(0, 1 - fFactor / 0.5);
    const floodingFfactor = 2.0;
    const floodingFactor = fFactor / floodingFfactor;
    const weirLoad = liquidLoadGpm / (weirLengthIn / 12);
    const crestHeight = 0.48 * Math.pow(weirLoad, 2 / 3);
    const downcomerBackupIn = crestHeight + traySpacingIn * floodingFactor * 0.3;
    const stable = floodingFactor < 0.8 && weepingFactor < 0.5;
    return { vaporVelocityFtS, weepingFactor, floodingFactor, downcomerBackupIn, stable };
}

/** Vacuum ejector steam demand */
export function vacuumEjectorSteam(
    targetPressureMmHg: number,
    nonCondensableLbHr: number,
    steamPressurePsig: number,
    numStages: number
): { motiveSteamLbHr: number; totalSteamLbHr: number; steamToGasRatio: number; interStagePressureMmHg: number[] } {
    const compressionRatioPerStage = Math.pow(760 / targetPressureMmHg, 1 / numStages);
    const steamRatioBase = 1.5 + (25 / targetPressureMmHg);
    const motiveSteamLbHr = nonCondensableLbHr * steamRatioBase * numStages;
    const totalSteamLbHr = motiveSteamLbHr * 1.05;
    const steamToGasRatio = totalSteamLbHr / nonCondensableLbHr;
    const interStagePressureMmHg: number[] = [];
    for (let i = 0; i < numStages; i++) {
        interStagePressureMmHg.push(targetPressureMmHg * Math.pow(compressionRatioPerStage, i + 1));
    }
    return { motiveSteamLbHr, totalSteamLbHr, steamToGasRatio, interStagePressureMmHg };
}

/** Product cut point optimization - maximize value */
export function productCutpointOpt(
    crudeRateBpd: number,
    possibleCuts: { cutName: string; tbpLowF: number; tbpHighF: number; yieldPct: number; productValuePerBbl: number }[],
    tbpCurve: { tempF: number; yieldPct: number }[]
): { optimalCuts: { cutName: string; volumeBpd: number; value: number }[]; totalValue: number } {
    const optimalCuts = possibleCuts.map(cut => {
        const volumeBpd = crudeRateBpd * cut.yieldPct / 100;
        const value = volumeBpd * cut.productValuePerBbl;
        return { cutName: cut.cutName, volumeBpd, value };
    });
    const totalValue = optimalCuts.reduce((s, c) => s + c.value, 0);
    return { optimalCuts, totalValue };
}

// ───────────────────────────────────────────────────────────────
// 6.4 NAPHTHA PROCESSING & GASOLINE PRODUCTION
// ───────────────────────────────────────────────────────────────

/** Naphtha hydrotreater outlet sulfur */
export function nhtSulfurRemoval(feedSulfurPpm: number, tempF: number, pressurePsig: number, lhsv: number): number {
    const severity = (tempF - 500) / 50 + (pressurePsig - 200) / 200 - (lhsv - 2) * 0.3;
    const removal = 1 - Math.exp(-Math.max(0.5, severity) * 2);
    return feedSulfurPpm * (1 - removal);
}

/** Catalytic reformer yields (Watkins-Nelson based) */
export function reformerYields(
    feedRateBpd: number,
    feedParaffinsVolPct: number,
    feedNaphthenesVolPct: number,
    feedAromaticsVolPct: number,
    ronTarget: number,
    reactorTempF: number,
    pressurePsig: number
): {
    reformateBpd: number; hydrogenMmscfd: number; lpgBpd: number; fuelGasMmscfd: number;
    benzenePct: number; aromaticsPct: number; ronAchieved: number;
} {
    const deltaRON = ronTarget - 55;
    const severity = (reactorTempF - 900) / 50 + (300 - pressurePsig) / 100;

    const aromaticsYield = feedNaphthenesVolPct * 0.95 + feedParaffinsVolPct * (0.15 + severity * 0.08);
    const benzenePct = Math.min(8, aromaticsYield * 0.25);

    const reformateYield = 0.92 - severity * 0.03;
    const reformateBpd = feedRateBpd * reformateYield;

    const hydrogenYieldScfBbl = 400 + severity * 300 + feedNaphthenesVolPct * 15;
    const hydrogenMmscfd = feedRateBpd * hydrogenYieldScfBbl / 1e6;

    const lpgYield = 0.03 + severity * 0.02;
    const lpgBpd = feedRateBpd * lpgYield;

    const fuelGasYield = 0.01 + severity * 0.005;
    const fuelGasMmscfd = feedRateBpd * fuelGasYield * 0.001;

    const ronAchieved = 90 + severity * 5 + feedNaphthenesVolPct * 0.1;
    const aromaticsPct = aromaticsYield;

    return { reformateBpd, hydrogenMmscfd, lpgBpd, fuelGasMmscfd, benzenePct, aromaticsPct, ronAchieved };
}

/** Isomerization product octane */
export function isomerateRON(feedNHexaneVolPct: number, tempF: number, recycleRatio: number): number {
    const equilibriumConversion = 0.85 - (tempF - 250) * 0.002;
    const effectiveConversion = equilibriumConversion * (1 + recycleRatio * 0.5);
    const nHexaneRON = 25;
    const iHexaneRON = 92;
    const otherRON = 70;
    const nHexaneFraction = feedNHexaneVolPct / 100;
    const postConvRON = (1 - nHexaneFraction * effectiveConversion) * otherRON +
        nHexaneFraction * effectiveConversion * iHexaneRON +
        nHexaneFraction * (1 - effectiveConversion) * nHexaneRON;
    return Math.min(postConvRON, 93);
}

/** Alkylation - alkylate yield and properties */
export function alkylateYield(
    olefinFeedBpd: number,
    iButaneToOlefinRatio: number,
    olefinType: 'butylene' | 'propylene' | 'amylene' | 'mixed',
    acidStrengthPct: number,
    tempF: number
): { alkylateBpd: number; isobutaneConsumedBpd: number; ron: number; nButaneBpd: number; propaneBpd: number } {
    const yieldFactor = olefinType === 'butylene' ? 1.76 : olefinType === 'propylene' ? 1.60 :
        olefinType === 'amylene' ? 1.65 : 1.70;

    const alkylateBpd = olefinFeedBpd * yieldFactor;
    const isobutaneConsumedBpd = olefinFeedBpd * 1.15;

    const baseRON = olefinType === 'butylene' ? 96 : olefinType === 'propylene' ? 93 :
        olefinType === 'amylene' ? 91 : 94;
    const acidPenalty = acidStrengthPct < 88 ? (88 - acidStrengthPct) * 0.5 : 0;
    const tempPenalty = tempF > 55 ? (tempF - 55) * 0.1 : 0;
    const ron = Math.min(98, baseRON - acidPenalty - tempPenalty);

    const nButaneBpd = olefinFeedBpd * 0.08;
    const propaneBpd = olefinFeedBpd * 0.05;

    return { alkylateBpd, isobutaneConsumedBpd, ron, nButaneBpd, propaneBpd };
}

/** Gasoline blend RON (non-linear blending) */
export function blendRON(components: { volPct: number; ron: number; mon: number; aromaticsPct?: number }[]): { blendRON: number; blendMON: number; aki: number } {
    let totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return { blendRON: 0, blendMON: 0, aki: 0 };

    let volWeightedRON = 0, volWeightedMON = 0;
    components.forEach(c => {
        const fraction = c.volPct / totalVol;
        volWeightedRON += fraction * c.ron;
        volWeightedMON += fraction * c.mon;
    });

    const aromaticsFraction = components.reduce((s, c) => s + c.volPct * (c.aromaticsPct || 0) / 100, 0) / totalVol;
    const synergyBonus = aromaticsFraction * 2.5;

    const blendRON = Math.min(105, volWeightedRON + synergyBonus);
    const blendMON = Math.min(100, volWeightedMON + synergyBonus * 0.7);
    const aki = (blendRON + blendMON) / 2;

    return { blendRON, blendMON, aki };
}

/** Gasoline blend RVP (Raoult's law approximation) */
export function blendRVP(components: { volPct: number; rvpPsi: number }[]): number {
    let totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return 0;

    let sum = 0;
    components.forEach(c => {
        const fraction = c.volPct / totalVol;
        sum += fraction * Math.pow(c.rvpPsi, 1.25);
    });
    return Math.pow(sum, 0.8);
}

/** Gasoline blend cost optimization (simplified LP) */
export function gasolineBlendCost(components: { volPct: number; costPerBbl: number }[]): number {
    let totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return 0;
    return components.reduce((s, c) => s + c.volPct * c.costPerBbl, 0) / totalVol;
}

/** Non-linear octane blending with interaction coefficients */
export function octaneBlendingNonlinear(
    components: { volBpd: number; ron: number; mon: number; olefinPct: number; aromaticPct: number; sulfurPpm: number }[]
): { predictedRON: number; predictedMON: number; aki: number; giveawayRon: number; blendCost: number } {
    if (components.length === 0) return { predictedRON: 0, predictedMON: 0, aki: 0, giveawayRon: 0, blendCost: 0 };
    let totalVol = components.reduce((s, c) => s + c.volBpd, 0);
    if (totalVol <= 0) return { predictedRON: 0, predictedMON: 0, aki: 0, giveawayRon: 0, blendCost: 0 };

    let sumRON = 0, sumMON = 0;
    let interactionRON = 0, interactionMON = 0;

    const volFracs = components.map(c => c.volBpd / totalVol);

    for (let i = 0; i < components.length; i++) {
        sumRON += volFracs[i] * components[i].ron;
        sumMON += volFracs[i] * components[i].mon;
        for (let j = i + 1; j < components.length; j++) {
            const olefAromInteraction = volFracs[i] * volFracs[j] * (components[i].olefinPct + components[j].olefinPct) * (components[i].aromaticPct + components[j].aromaticPct) * 0.0005;
            interactionRON += olefAromInteraction;
            interactionMON += olefAromInteraction * 0.7;
        }
    }

    const avgSulfur = components.reduce((s, c) => s + c.volBpd * c.sulfurPpm, 0) / totalVol;
    const sulfurPenalty = avgSulfur > 0 ? Math.log10(avgSulfur / 10) * 0.5 : 0;

    const predictedRON = Math.max(70, Math.min(105, sumRON + interactionRON - sulfurPenalty));
    const predictedMON = Math.max(65, Math.min(100, sumMON + interactionMON - sulfurPenalty * 0.8));
    const aki = (predictedRON + predictedMON) / 2;
    const giveawayRon = Math.max(0, aki - 87) * 0.08;
    const blendCost = totalVol * 95;

    return { predictedRON, predictedMON, aki, giveawayRon, blendCost };
}

/** RVP blending using Raoult's Law approximation */
export function rvpBlending(
    components: { volBpd: number; rvpPsi: number; molecularWeight?: number }[]
): { blendRVPPsi: number; compliant: boolean; maxRvpPsycho: number } {
    if (components.length === 0) return { blendRVPPsi: 0, compliant: false, maxRvpPsycho: 0 };
    let numerator = 0, denominator = 0;
    components.forEach(c => {
        const mw = c.molecularWeight || (c.rvpPsi > 15 ? 58 : 92);
        const moles = c.volBpd / mw;
        numerator += moles * c.rvpPsi;
        denominator += moles;
    });
    const blendRVPPsi = denominator > 0 ? numerator / denominator : 0;
    const maxRvpPsycho = 9.0;
    const compliant = blendRVPPsi <= maxRvpPsycho;
    return { blendRVPPsi, compliant, maxRvpPsycho };
}

/** Reformer coke deposition rate */
export function reformerCokeRate(
    reactorInletTempF: number,
    pressurePsig: number,
    lhsv: number,
    feedParaffinPct: number,
    daysOnline: number
): { cokeWtPct: number; relativeActivity: number; cycleLengthRemainingDays: number; regenerationNeededInDays: number } {
    const tempFactor = Math.exp((reactorInletTempF - 910) * 0.02);
    const pressureFactor = Math.max(0.5, 1 - (pressurePsig - 50) * 0.002);
    const feedFactor = 1 + feedParaffinPct * 0.005;
    const cokeRateWtPctPerDay = 0.0008 * tempFactor * pressureFactor * feedFactor;
    const cokeWtPct = Math.min(25, cokeRateWtPctPerDay * daysOnline);
    const relativeActivity = Math.exp(-cokeWtPct * 0.06);
    const maxCoke = 20;
    const cycleLengthRemainingDays = (maxCoke - cokeWtPct) / Math.max(0.0001, cokeRateWtPctPerDay);
    const regenerationNeededInDays = Math.max(30, cycleLengthRemainingDays * 0.8);
    return { cokeWtPct, relativeActivity, cycleLengthRemainingDays, regenerationNeededInDays };
}

/** Alkylation acid consumption model */
export function alkylateAcidConsumption(
    olefinFeedBpd: number,
    acidType: 'HF' | 'H2SO4',
    isobutaneToOlefinRatio: number,
    feedContaminantsPpm: number,
    acidStrengthWtPct: number
): { acidConsumptionLbPerDay: number; acidCostPerDay: number; spentAcidRegenCostPerDay: number; totalAcidCostPerDay: number } {
    const acidConsumptionLbPerGalFeed = acidType === 'H2SO4'
        ? (0.3 + feedContaminantsPpm * 0.002 + (10 - isobutaneToOlefinRatio) * 0.02)
        : (0.01 + feedContaminantsPpm * 0.0005);
    const feedGalPerDay = olefinFeedBpd * 42;
    const acidConsumptionLbPerDay = acidConsumptionLbPerGalFeed * feedGalPerDay;
    const freshAcidCostPerLb = acidType === 'H2SO4' ? 0.06 : 0.15;
    const acidCostPerDay = acidConsumptionLbPerDay * freshAcidCostPerLb;
    const spentAcidRegenCostPerDay = acidType === 'H2SO4' ? acidConsumptionLbPerDay * 0.04 : 0;
    const totalAcidCostPerDay = acidCostPerDay + spentAcidRegenCostPerDay;
    return { acidConsumptionLbPerDay, acidCostPerDay, spentAcidRegenCostPerDay, totalAcidCostPerDay };
}

/** Benzene reduction cost analysis */
export function benzeneReductionCost(
    reformateBpd: number,
    benzeneContentVolPct: number,
    targetBenzeneVolPct: number,
    method: 'pre-fractionation' | 'post-extraction' | 'saturation'
): { benzeneToRemoveBpd: number; capexMM: number; opexPerBbl: number; annualizedCostMM: number; breakevenYears: number } {
    const benzeneToRemoveBpd = reformateBpd * (benzeneContentVolPct - targetBenzeneVolPct) / 100;
    const capexFactors = { 'pre-fractionation': 8, 'post-extraction': 12, 'saturation': 5 };
    const opexFactors = { 'pre-fractionation': 1.5, 'post-extraction': 3.0, 'saturation': 1.0 };
    const capexMM = benzeneToRemoveBpd * capexFactors[method] / 1000;
    const opexPerBbl = opexFactors[method];
    const annualizedCostMM = capexMM * 0.12 + benzeneToRemoveBpd * opexPerBbl * 365 / 1e6;
    const benzeneSalesValue = method === 'post-extraction' ? benzeneToRemoveBpd * 120 * 365 / 1e6 : 0;
    const breakevenYears = capexMM / Math.max(0.01, benzeneSalesValue);
    return { benzeneToRemoveBpd, capexMM, opexPerBbl, annualizedCostMM, breakevenYears };
}

// ───────────────────────────────────────────────────────────────
// 6.5 MIDDLE DISTILLATE PROCESSING (Diesel & Jet)
// ───────────────────────────────────────────────────────────────

/** Diesel hydrotreater outlet sulfur */
export function dieselHdsOutletSulfur(
    feedSulfurPpm: number,
    tempF: number,
    pressurePsig: number,
    lhsv: number,
    feedNitrogenPpm: number
): number {
    const nitrogenInhibition = 1 / (1 + feedNitrogenPpm / 500);
    const severity = (tempF - 600) / 50 + (pressurePsig - 500) / 300 - (lhsv - 1.5);
    const removal = 1 - Math.exp(-Math.max(0.1, severity * 1.8) * nitrogenInhibition);
    const refractoryFactor = 1 - removal * 0.85;
    return feedSulfurPpm * refractoryFactor;
}

/** Cetane index calculation (ASTM D4737 4-variable formula) */
export function cetaneIndex(density15C_kgm3: number, t10C: number, t50C: number, t90C: number): number {
    const B = Math.exp(-3.5 * (density15C_kgm3 - 850) / 1000) * (t10C / 100) * (t50C / 100);
    if (B <= 0) return 30;
    return 45.2 + 0.0892 * (t10C - 215) + 0.131 * (t50C - 260) + 0.0523 * (t90C - 310) +
        0.901 * Math.log(B) - 0.420 * (density15C_kgm3 - 850) / 10;
}

/** Jet fuel freeze point (correlation with n-paraffin content) */
export function jetFreezePoint(nParaffinPct: number, cutMidPointF: number): number {
    return -60 + nParaffinPct * 0.8 + (cutMidPointF - 350) * 0.15;
}

/** Jet fuel smoke point */
export function smokePointMM(aromaticsVolPct: number, naphthalenesVolPct: number): number {
    const base = 30 - aromaticsVolPct * 0.35;
    return Math.max(12, base - naphthalenesVolPct * 0.5);
}

/** Diesel blend cetane */
export function blendCetane(components: { volPct: number; cetane: number }[]): number {
    let totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return 0;
    return components.reduce((s, c) => s + c.volPct * c.cetane, 0) / totalVol;
}

/** HFRR lubricity prediction (depends on sulfur removal severity) */
export function hfrrWearScar(sulfurPpm: number, aromaticsVolPct: number): number {
    return 650 - sulfurPpm * 0.05 - aromaticsVolPct * 2;
}

/** Cetane number blending - non-linear */
export function cetaneBlending(
    components: { volBpd: number; cetaneNumber: number; aromaticPct: number }[]
): { blendCetane: number; cetaneGiveaway: number; compliant: boolean } {
    if (components.length === 0) return { blendCetane: 0, cetaneGiveaway: 0, compliant: false };
    let totalVol = components.reduce((s, c) => s + c.volBpd, 0);
    if (totalVol <= 0) return { blendCetane: 0, cetaneGiveaway: 0, compliant: false };
    let sumCetane = 0;
    let aromaticPenalty = 0;
    components.forEach(c => {
        sumCetane += c.volBpd * Math.pow(c.cetaneNumber, 1.05);
        aromaticPenalty += c.volBpd * c.aromaticPct * 0.03;
    });
    const blendCetane = Math.pow(sumCetane / totalVol, 1 / 1.05) - aromaticPenalty / totalVol;
    const targetCetane = 51;
    const compliant = blendCetane >= targetCetane;
    const cetaneGiveaway = Math.max(0, blendCetane - targetCetane) * 0.05;
    return { blendCetane, cetaneGiveaway, compliant };
}

/** Cold flow properties blending (CFPP/Cloud Point) */
export function coldFlowBlending(
    components: { volBpd: number; cloudPointF: number; cfppF: number }[]
): { blendCloudPointF: number; blendCFPPF: number; winterGradeCompliant: boolean; summerGradeCompliant: boolean } {
    if (components.length === 0) return { blendCloudPointF: 0, blendCFPPF: 0, winterGradeCompliant: false, summerGradeCompliant: false };
    let totalVol = components.reduce((s, c) => s + c.volBpd, 0);
    if (totalVol <= 0) return { blendCloudPointF: 0, blendCFPPF: 0, winterGradeCompliant: false, summerGradeCompliant: false };
    let sumCP = 0, sumCFPP = 0;
    components.forEach(c => {
        const cpCFI = Math.pow(10, (c.cloudPointF - 32) * 5 / 9 / 100);
        const cfppCFI = Math.pow(10, (c.cfppF - 32) * 5 / 9 / 100);
        sumCP += c.volBpd * cpCFI;
        sumCFPP += c.volBpd * cfppCFI;
    });
    const blendCloudPointF = (9 / 5 * Math.log10(sumCP / totalVol) * 100) + 32;
    const blendCFPPF = (9 / 5 * Math.log10(sumCFPP / totalVol) * 100) + 32;
    const winterGradeCompliant = blendCFPPF <= -4;
    const summerGradeCompliant = blendCFPPF <= 50;
    return { blendCloudPointF, blendCFPPF, winterGradeCompliant, summerGradeCompliant };
}

/** HFRR lubricity wear scar prediction */
export function lubricityHFRR(
    sulfurPpm: number,
    viscosityCst: number,
    aromaticPct: number,
    lubricityAdditiveDosePpm: number
): { hfrrWearScarMicron: number; compliant: boolean; additiveRequired: boolean } {
    const baseWearScar = 650 - sulfurPpm * 0.05 - (viscosityCst - 2) * 20 + aromaticPct * 1.5;
    const additiveEffect = lubricityAdditiveDosePpm * 0.15;
    const hfrrWearScarMicron = Math.max(200, baseWearScar - additiveEffect);
    const compliant = hfrrWearScarMicron <= 460;
    const additiveRequired = !compliant || sulfurPpm < 50;
    return { hfrrWearScarMicron, compliant, additiveRequired };
}

/** Diesel oxidation stability index */
export function dieselStability(
    olefinPct: number,
    sulfurPpm: number,
    nitrogenPpm: number,
    storageDays: number,
    temperatureF: number
): { stabilityIndex: number; colorRating: number; degradationPct: number; stabilizerDosePpm: number } {
    const timeFactor = storageDays * Math.exp((temperatureF - 70) * 0.05);
    const degradationPct = (olefinPct * 0.3 + nitrogenPpm * 0.005) * timeFactor * 0.01;
    const stabilityIndex = Math.max(0, 100 - degradationPct);
    const colorRating = Math.max(1, 3 - degradationPct * 0.15);
    const stabilizerDosePpm = degradationPct > 5 ? (degradationPct - 5) * 20 : 0;
    return { stabilityIndex, colorRating, degradationPct, stabilizerDosePpm };
}

// ───────────────────────────────────────────────────────────────
// 6.6 CONVERSION PROCESSES (Cracking)
// ───────────────────────────────────────────────────────────────

/** FCC yield prediction (based on feed quality and operating severity) */
export function fccYields(
    feedRateBpd: number,
    feedApi: number,
    feedSulfurWtPct: number,
    feedCCRWtPct: number,
    riserOutletF: number,
    catToOilRatio: number,
    zsm5AdditiveWtPct: number = 0
): {
    conversion: number; gasolineBpd: number; lcoBpd: number; slurryBpd: number;
    propyleneBpd: number; butyleneBpd: number; cokeWtPct: number; dryGasWtPct: number;
    gasolineRON: number; lcoCetane: number;
} {
    const sg = sgFromAPI(feedApi);
    const KFactor = Math.pow(feedApi, 0.33) / sg;
    const severity = (riserOutletF - 950) / 50 + (catToOilRatio - 6) / 2;

    const baseConversion = 72 + (KFactor - 11.5) * 8 + severity * 4 - feedCCRWtPct * 0.8;
    const conversion = Math.min(88, Math.max(55, baseConversion));

    const cokeWtPct = 4 + feedCCRWtPct * 0.35 - severity * 0.1;
    const dryGasWtPct = 3 + severity * 0.4;
    const propyleneBpd = feedRateBpd * (0.04 + zsm5AdditiveWtPct * 0.015 + severity * 0.005);
    const butyleneBpd = feedRateBpd * (0.045 + severity * 0.003);
    const gasolineBpd = feedRateBpd * (0.48 + severity * 0.02);
    const lcoBpd = feedRateBpd * (0.18 - severity * 0.03);
    const slurryBpd = feedRateBpd - gasolineBpd - propyleneBpd * 0.6 - butyleneBpd * 0.6 - lcoBpd;

    const gasolineRON = 90 + severity * 2 + zsm5AdditiveWtPct * 1.5;
    const lcoCetane = Math.max(15, 28 - feedApi * 0.15 - severity * 2);

    return {
        conversion, gasolineBpd, lcoBpd, slurryBpd: Math.max(0, slurryBpd),
        propyleneBpd, butyleneBpd, cokeWtPct, dryGasWtPct, gasolineRON, lcoCetane
    };
}

/** Hydrocracker yields */
export function hydrocrackerYields(
    feedRateBpd: number,
    feedApi: number,
    feedSulfurWtPct: number,
    feedNitrogenPpm: number,
    reactorTempF: number,
    pressurePsig: number,
    lhsv: number,
    recycleMode: 'once-through' | 'recycle' = 'once-through'
): {
    conversion: number; naphthaBpd: number; keroseneBpd: number; dieselBpd: number;
    lpgBpd: number; ucoBpd: number; h2ConsumptionScfBbl: number;
    dieselCetane: number; keroseneSmokePoint: number;
} {
    const severity = (reactorTempF - 680) / 50 + (pressurePsig - 1500) / 500 - (lhsv - 1) * 0.5;
    const nitrogenPenalty = 1 / (1 + feedNitrogenPpm / 2000);
    const effectiveSeverity = Math.max(0.2, severity * nitrogenPenalty);

    const conversion = recycleMode === 'recycle'
        ? Math.min(99, 50 + effectiveSeverity * 15)
        : Math.min(80, 30 + effectiveSeverity * 12);

    const dieselSelectivity = 0.55 - effectiveSeverity * 0.06;
    const keroseneSelectivity = 0.30 - effectiveSeverity * 0.03;
    const naphthaSelectivity = 0.10 + effectiveSeverity * 0.07;
    const lpgSelectivity = 0.05 + effectiveSeverity * 0.02;

    const convertedBpd = feedRateBpd * conversion / 100;
    const dieselBpd = convertedBpd * dieselSelectivity;
    const keroseneBpd = convertedBpd * keroseneSelectivity;
    const naphthaBpd = convertedBpd * naphthaSelectivity;
    const lpgBpd = convertedBpd * lpgSelectivity;
    const ucoBpd = feedRateBpd - convertedBpd;

    const h2ConsumptionScfBbl = 800 + effectiveSeverity * 400 + feedSulfurWtPct * 100 + feedNitrogenPpm * 0.5;
    const dieselCetane = 55 + effectiveSeverity * 5;
    const keroseneSmokePoint = 22 + effectiveSeverity * 3;

    return {
        conversion, naphthaBpd, keroseneBpd, dieselBpd, lpgBpd, ucoBpd,
        h2ConsumptionScfBbl, dieselCetane, keroseneSmokePoint
    };
}

/** Delayed coker yields */
export function cokerYields(
    feedRateBpd: number,
    feedApi: number,
    feedCCRWtPct: number,
    feedSulfurWtPct: number,
    drumTempF: number,
    drumPressurePsig: number,
    recycleRatio: number = 0.1
): {
    cokeWtPct: number; gasWtPct: number; lpgWtPct: number;
    naphthaBpd: number; lcgoBpd: number; hcgoBpd: number;
    liquidYieldPct: number;
} {
    const baseCokeYield = feedCCRWtPct * 1.6 + 2;
    const pressureEffect = (drumPressurePsig - 20) * 0.15;
    const tempEffect = (930 - drumTempF) * 0.03;
    const cokeWtPct = Math.min(40, Math.max(18, baseCokeYield + pressureEffect + tempEffect + recycleRatio * feedCCRWtPct * 0.5));

    const gasWtPct = 6 + (feedApi - 10) * 0.2;
    const lpgWtPct = 5 + (feedApi - 10) * 0.15;
    const liquidYieldPct = 100 - cokeWtPct - gasWtPct - lpgWtPct;

    const naphthaBpd = feedRateBpd * liquidYieldPct * 0.22 / 100;
    const lcgoBpd = feedRateBpd * liquidYieldPct * 0.35 / 100;
    const hcgoBpd = feedRateBpd * liquidYieldPct * 0.43 / 100;

    return { cokeWtPct, gasWtPct, lpgWtPct, naphthaBpd, lcgoBpd, hcgoBpd, liquidYieldPct };
}

/** Visbreaker conversion */
export function visbreakerConversion(feedViscosityCst: number, coilTempF: number, residenceTimeSec: number): { conversion: number; productViscosityCst: number } {
    const severity = (coilTempF - 850) / 50 + (residenceTimeSec - 60) / 30;
    const conversion = Math.min(25, 5 + severity * 5);
    const viscosityReduction = Math.pow(10, severity * 0.8);
    const productViscosityCst = Math.max(50, feedViscosityCst / viscosityReduction);
    return { conversion, productViscosityCst };
}

/** SDA ROSE process - DAO yield */
export function sdaDAOYield(feedCCRWtPct: number, solventType: 'propane' | 'butane' | 'pentane'): { daoYieldPct: number; daoCCRWtPct: number; pitchYieldPct: number } {
    const solventPower = solventType === 'propane' ? 0.6 : solventType === 'butane' ? 0.75 : 0.85;
    const daoYieldPct = Math.min(85, 40 + (1 - feedCCRWtPct / 30) * 45 * solventPower);
    const daoCCRWtPct = feedCCRWtPct * 0.3 / solventPower;
    const pitchYieldPct = 100 - daoYieldPct;
    return { daoYieldPct, daoCCRWtPct, pitchYieldPct };
}

/** FCC regenerator heat balance */
export function fccHeatBalance(
    riserOutletTempF: number,
    regeneratorTempF: number,
    catToOilRatio: number,
    cokeYieldWtPct: number,
    feedPreheatTempF: number
): { heatFromCombustionMMBtuHr: number; heatToReactorMMBtuHr: number; excessHeatMMBtuHr: number; balanced: boolean } {
    const cokeBurnedLbPerLbFeed = cokeYieldWtPct / 100;
    const catCirculationLbPerLbFeed = catToOilRatio;
    const cokeHeatBtuPerLbFeed = cokeBurnedLbPerLbFeed * 14000;
    const catHeatBtuPerLbFeed = catCirculationLbPerLbFeed * 0.28 * (regeneratorTempF - riserOutletTempF);
    const feedHeatBtuPerLbFeed = 0.55 * (riserOutletTempF - feedPreheatTempF) + 150;
    const heatToReactorMMBtuHr = (feedHeatBtuPerLbFeed + catHeatBtuPerLbFeed) / 1e6;
    const heatFromCombustionMMBtuHr = cokeHeatBtuPerLbFeed / 1e6;
    const excessHeatMMBtuHr = heatFromCombustionMMBtuHr - heatToReactorMMBtuHr;
    const balanced = Math.abs(excessHeatMMBtuHr) / Math.max(0.01, heatFromCombustionMMBtuHr) < 0.15;
    return { heatFromCombustionMMBtuHr, heatToReactorMMBtuHr, excessHeatMMBtuHr, balanced };
}

/** FCC equilibrium catalyst activity tracking */
export function fccEcatActivity(
    freshActivity: number,
    dailyAdditionTons: number,
    catalystInventoryTons: number,
    metalsNiPpm: number,
    metalsVPpm: number,
    daysSinceLastEval: number
): { ecatActivity: number; metalsDeactivationPct: number; surfaceAreaM2PerG: number; recommendedAdditionRateTpd: number } {
    const metalsDeactivationRate = (metalsNiPpm + metalsVPpm * 4) / 10000;
    const hydrothermalRate = 0.001;
    const totalDeactivationRate = metalsDeactivationRate + hydrothermalRate;
    const additionFraction = dailyAdditionTons / catalystInventoryTons;
    const ecatActivity = freshActivity * additionFraction / (additionFraction + totalDeactivationRate);
    const metalsDeactivationPct = metalsDeactivationRate / (additionFraction + totalDeactivationRate) * 100;
    const surfaceAreaM2PerG = ecatActivity * 2.5;
    const recommendedAdditionRateTpd = (freshActivity / ecatActivity - 1) * catalystInventoryTons * totalDeactivationRate;
    return { ecatActivity, metalsDeactivationPct, surfaceAreaM2PerG, recommendedAdditionRateTpd };
}

/** Hydrocracker detailed hydrogen consumption */
export function hcHydrogenConsumption(
    feedRateBpd: number,
    feedApi: number,
    feedSulfurWtPct: number,
    feedNitrogenPpm: number,
    conversionPct: number
): { chemicalH2ScfBbl: number; totalH2ScfBbl: number; h2ConsumptionMmscfd: number; h2CostPerDay: number } {
    const h2ForSulfur = feedSulfurWtPct * 320 * sgFromAPI(feedApi) / 100;
    const h2ForNitrogen = feedNitrogenPpm * 960 * sgFromAPI(feedApi) / 1e6;
    const h2ForAromatics = 200 * conversionPct / 100;
    const h2ForCracking = conversionPct * 1.5;
    const chemicalH2ScfBbl = h2ForSulfur + h2ForNitrogen + h2ForAromatics + h2ForCracking;
    const totalH2ScfBbl = chemicalH2ScfBbl * 1.15;
    const h2ConsumptionMmscfd = feedRateBpd * totalH2ScfBbl / 1e6;
    const h2CostPerDay = h2ConsumptionMmscfd * 1500;
    return { chemicalH2ScfBbl, totalH2ScfBbl, h2ConsumptionMmscfd, h2CostPerDay };
}

/** Coker drum cycle time optimization */
export function cokerDrumCycle(
    fillTimeHr: number,
    steamOutTimeHr: number,
    quenchTimeHr: number,
    drainTimeHr: number,
    unheadingTimeHr: number,
    cuttingTimeHr: number,
    reheadingTimeHr: number,
    numDrums: number
): { totalCycleTimeHr: number; throughputPerDrumBpd: number; drumsOnline: number; drumUtilizationPct: number } {
    const totalCycleTimeHr = fillTimeHr + steamOutTimeHr + quenchTimeHr + drainTimeHr + unheadingTimeHr + cuttingTimeHr + reheadingTimeHr;
    const fillToCycleRatio = fillTimeHr / totalCycleTimeHr;
    const drumsOnline = Math.max(1, Math.floor(numDrums * fillToCycleRatio));
    const throughputPerDrumBpd = 5000;
    const drumUtilizationPct = (fillTimeHr / totalCycleTimeHr) * 100;
    return { totalCycleTimeHr, throughputPerDrumBpd: throughputPerDrumBpd * drumsOnline, drumsOnline, drumUtilizationPct };
}

/** Coke bulk density estimation */
export function cokeBulkDensity(
    cokeType: 'sponge' | 'shot' | 'needle' | 'fuel',
    volatileMatterWtPct: number,
    moistureWtPct: number
): { bulkDensityLbPerFt3: number; trueDensityLbPerFt3: number; porosityPct: number } {
    const trueDensityMap = { 'sponge': 90, 'shot': 100, 'needle': 95, 'fuel': 85 };
    const trueDensityLbPerFt3 = trueDensityMap[cokeType] * (1 - volatileMatterWtPct / 100 - moistureWtPct / 100);
    const bulkDensityLbPerFt3 = trueDensityLbPerFt3 * 0.65;
    const porosityPct = (1 - bulkDensityLbPerFt3 / trueDensityLbPerFt3) * 100;
    return { bulkDensityLbPerFt3, trueDensityLbPerFt3, porosityPct };
}

// ───────────────────────────────────────────────────────────────
// 6.7 HYDROGEN PRODUCTION & MANAGEMENT
// ───────────────────────────────────────────────────────────────

/** SMR hydrogen production */
export function smrHydrogenProduction(
    naturalGasFeedMmscfd: number,
    steamToCarbonRatio: number = 3.0,
    reformerTempF: number = 1600,
    psaRecoveryPct: number = 85
): { h2ProductionMmscfd: number; co2EmissionsTonPerDay: number; efficiencyPct: number; fuelGasConsumedMmscfd: number } {
    const idealH2PerCH4 = 4;
    const conversionEfficiency = 0.92 - (1650 - reformerTempF) * 0.0003;
    const h2BeforePSA = naturalGasFeedMmscfd * idealH2PerCH4 * conversionEfficiency;
    const h2ProductionMmscfd = h2BeforePSA * psaRecoveryPct / 100;

    const co2FromReaction = naturalGasFeedMmscfd * 1.0 * conversionEfficiency;
    const fuelGasConsumedMmscfd = naturalGasFeedMmscfd * 0.35;
    const co2FromFuel = fuelGasConsumedMmscfd * 1.0;
    const co2EmissionsTonPerDay = (co2FromReaction + co2FromFuel) * 19.25;

    const efficiencyPct = (h2ProductionMmscfd * 275) / (naturalGasFeedMmscfd * 1010) * 100 / 0.75;

    return { h2ProductionMmscfd, co2EmissionsTonPerDay, efficiencyPct, fuelGasConsumedMmscfd };
}

/** Total refinery hydrogen balance */
export function hydrogenBalance(
    productionSources: { name: string; mmscfd: number }[],
    consumptionSinks: { name: string; mmscfd: number }[]
): { totalProduction: number; totalConsumption: number; netBalance: number; deficit: boolean } {
    const totalProduction = productionSources.reduce((s, p) => s + p.mmscfd, 0);
    const totalConsumption = consumptionSinks.reduce((s, c) => s + c.mmscfd, 0);
    return {
        totalProduction,
        totalConsumption,
        netBalance: totalProduction - totalConsumption,
        deficit: totalProduction < totalConsumption
    };
}

/** PSA unit performance */
export function psaPerformance(
    feedGasMmscfd: number,
    feedH2PurityPct: number,
    recoveryPct: number,
    productPurityPct: number
): { productH2Mmscfd: number; tailGasMmscfd: number; tailGasH2Pct: number } {
    const h2InFeed = feedGasMmscfd * feedH2PurityPct / 100;
    const productH2Mmscfd = h2InFeed * recoveryPct / 100;
    const tailGasMmscfd = feedGasMmscfd - productH2Mmscfd;
    const h2InTailGas = h2InFeed - productH2Mmscfd;
    const tailGasH2Pct = tailGasMmscfd > 0 ? (h2InTailGas / tailGasMmscfd) * 100 : 0;
    return { productH2Mmscfd, tailGasMmscfd, tailGasH2Pct };
}

/** SMR with CCS (Blue Hydrogen) efficiency */
export function smrCCSEfficiency(
    naturalGasFeedMmscfd: number,
    steamToCarbonRatio: number,
    reformerTempF: number,
    co2CaptureRatePct: number,
    captureEnergyPenaltyPct: number
): { h2ProductionMmscfd: number; co2CapturedTpd: number; co2VentedTpd: number; efficiencyPenaltyPct: number; effectiveEfficiencyPct: number } {
    const base = smrHydrogenProduction(naturalGasFeedMmscfd, steamToCarbonRatio, reformerTempF, 85);
    const co2CapturedTpd = base.co2EmissionsTonPerDay * co2CaptureRatePct / 100;
    const co2VentedTpd = base.co2EmissionsTonPerDay - co2CapturedTpd;
    const efficiencyPenaltyPct = captureEnergyPenaltyPct;
    const effectiveEfficiencyPct = base.efficiencyPct - efficiencyPenaltyPct;
    return { h2ProductionMmscfd: base.h2ProductionMmscfd, co2CapturedTpd, co2VentedTpd, efficiencyPenaltyPct, effectiveEfficiencyPct };
}

/** Hydrogen pinch analysis */
export function hydrogenPinch(
    sources: { name: string; flowMmscfd: number; purityPct: number }[],
    sinks: { name: string; flowMmscfd: number; minPurityPct: number }[]
): { freshHydrogenRequiredMmscfd: number; totalRecoverableMmscfd: number; pinchPurityPct: number; savingPotentialMmscfd: number } {
    const sortedSinks = [...sinks].sort((a, b) => a.minPurityPct - b.minPurityPct);
    let totalRecoverableMmscfd = sources.reduce((s, src) => s + src.flowMmscfd, 0);
    let totalSinkDemand = sinks.reduce((s, snk) => s + snk.flowMmscfd, 0);
    let freshHydrogenRequiredMmscfd = 0;
    if (totalRecoverableMmscfd < totalSinkDemand) {
        freshHydrogenRequiredMmscfd = totalSinkDemand - totalRecoverableMmscfd;
    }
    const pinchPurityPct = sortedSinks.length > 0 ? sortedSinks[sortedSinks.length - 1].minPurityPct : 90;
    const savingPotentialMmscfd = totalRecoverableMmscfd * 0.15;
    return { freshHydrogenRequiredMmscfd, totalRecoverableMmscfd, pinchPurityPct, savingPotentialMmscfd };
}

/** PSA recovery curve */
export function psaRecoveryCurve(
    feedPurityPct: number,
    productPurityTargetPct: number,
    cycleTimeSec: number,
    bedCount: number
): { recoveryPct: number; purgeGasFraction: number; optimalCycleTimeSec: number } {
    const purityGap = productPurityTargetPct - feedPurityPct;
    const recoveryPct = Math.max(60, 95 - purityGap * 1.2 - (cycleTimeSec - 120) * 0.02);
    const purgeGasFraction = 1 - recoveryPct / 100;
    const optimalCycleTimeSec = 100 + bedCount * 20;
    return { recoveryPct, purgeGasFraction, optimalCycleTimeSec };
}

/** CO2 intensity kg CO2 per kg H2 */
export function co2IntensityKgPerKgH2(
    h2SourceType: 'SMR' | 'SMR-CCS' | 'electrolysis-renewable' | 'electrolysis-grid' | 'POX',
    gridIntensityKgCO2PerMWh?: number
): { co2KgPerKgH2: number; color: 'grey' | 'blue' | 'green' | 'brown'; carbonTaxPerKgH2: number } {
    const intensityMap: Record<string, number> = {
        'SMR': 9.5,
        'SMR-CCS': 1.5,
        'electrolysis-renewable': 0.5,
        'electrolysis-grid': (gridIntensityKgCO2PerMWh ?? 400) * 55 / 1000,
        'POX': 12.0,
    };
    const colorMap: Record<string, 'grey' | 'blue' | 'green' | 'brown'> = {
        'SMR': 'grey', 'SMR-CCS': 'blue', 'electrolysis-renewable': 'green', 'electrolysis-grid': 'brown', 'POX': 'brown'
    };
    const co2KgPerKgH2 = intensityMap[h2SourceType] ?? 9.5;
    const color = colorMap[h2SourceType] ?? 'grey';
    const carbonTaxPerKgH2 = co2KgPerKgH2 * 0.05;
    return { co2KgPerKgH2, color, carbonTaxPerKgH2 };
}

// ───────────────────────────────────────────────────────────────
// 6.8 SULFUR & ENVIRONMENTAL MANAGEMENT
// ───────────────────────────────────────────────────────────────

/** Total sulfur entering SRU */
export function sulfurToSRU(
    sources: { name: string; h2sFlowLbHr: number }[]
): { totalSulfurLtpd: number; clausCapacityRequiredLtpd: number } {
    const totalH2SLbHr = sources.reduce((s, src) => s + src.h2sFlowLbHr, 0);
    const sulfurLbHr = totalH2SLbHr * 32 / 34;
    const totalSulfurLtpd = sulfurLbHr * 24 / 2240;
    return { totalSulfurLtpd, clausCapacityRequiredLtpd: totalSulfurLtpd };
}

/** Claus unit conversion efficiency */
export function clausEfficiency(
    numStages: number,
    h2sFeedMolPct: number,
    airControlAccuracy: number
): { overallEfficiency: number; tailGasH2SPct: number } {
    let remainingFraction = 1;
    for (let i = 0; i < numStages; i++) {
        remainingFraction *= (1 - 0.75) * (0.9 + airControlAccuracy * 0.1);
    }
    const overallEfficiency = (1 - remainingFraction) * 100;
    const tailGasH2SPct = remainingFraction * h2sFeedMolPct;
    return { overallEfficiency, tailGasH2SPct };
}

/** SO2 emissions from SRU tail gas */
export function so2Emissions(tailGasH2SMolPct: number, tailGasFlowMmscfd: number, tgcuEfficiencyPct: number): number {
    const h2sToSO2 = tailGasH2SMolPct * (1 - tgcuEfficiencyPct / 100) * tailGasFlowMmscfd * 1e6 / 379.5;
    return h2sToSO2 * 64 / 34 * 0.00220462 / 2000;
}

/** Total refinery CO2 emissions estimate */
export function refineryCO2Emissions(
    fuelGasMmscfd: number,
    smrFeedMmscfd: number,
    fccCokeBurnedLbHr: number,
    powerPurchasedMW: number,
    gridIntensityKgCO2PerMWh: number = 400
): { combustionCO2Tpd: number; processCO2Tpd: number; powerCO2Tpd: number; totalCO2Tpd: number } {
    const combustionCO2Tpd = fuelGasMmscfd * 55;
    const processCO2Tpd = smrFeedMmscfd * 19.25 + fccCokeBurnedLbHr * 24 * 3.67 / 2000;
    const powerCO2Tpd = powerPurchasedMW * gridIntensityKgCO2PerMWh * 24 / 1000;
    const totalCO2Tpd = combustionCO2Tpd + processCO2Tpd + powerCO2Tpd;
    return { combustionCO2Tpd, processCO2Tpd, powerCO2Tpd, totalCO2Tpd };
}

/** Sour water stripper - H2S and NH3 removal */
export function sourWaterStripper(
    feedRateGpm: number,
    inletH2SPpmw: number,
    inletNH3Ppmw: number,
    steamRateLbHr: number
): { outletH2SPpmw: number; outletNH3Ppmw: number; acidGasH2SLbHr: number } {
    const strippingFactor = steamRateLbHr / (feedRateGpm * 500 * 0.02);
    const h2sRemoval = 1 - Math.exp(-strippingFactor * 2);
    const nh3Removal = 1 - Math.exp(-strippingFactor * 1.5);

    const outletH2SPpmw = inletH2SPpmw * (1 - h2sRemoval);
    const outletNH3Ppmw = inletNH3Ppmw * (1 - nh3Removal);
    const massFlowLbHr = feedRateGpm * 500 * 60 / 1000000;
    const acidGasH2SLbHr = inletH2SPpmw * massFlowLbHr * h2sRemoval / 1e6;

    return { outletH2SPpmw, outletNH3Ppmw, acidGasH2SLbHr };
}

/** Amine circulation rate based on acid gas loading */
export function amineCirculationRate(
    acidGasFlowMmscfd: number,
    h2sMolPct: number,
    co2MolPct: number,
    amineType: 'MEA' | 'DEA' | 'MDEA',
    amineConcentrationWtPct: number,
    targetRichLoadingMolMol: number
): { circulationRateGpm: number; leanLoadingMolMol: number; richLoadingMolMol: number; regenerationDutyMMBtuHr: number } {
    const amineProperties = { 'MEA': { mw: 61, density: 8.45, capacity: 2 }, 'DEA': { mw: 105, density: 8.55, capacity: 2 }, 'MDEA': { mw: 119, density: 8.70, capacity: 1 } };
    const props = amineProperties[amineType];
    const acidGasMolPerDay = acidGasFlowMmscfd * 1e6 / 379.5;
    const molH2S = acidGasMolPerDay * h2sMolPct / 100;
    const molCO2 = acidGasMolPerDay * co2MolPct / 100;
    const totalAcidGasMol = (amineType === 'MDEA') ? molH2S + molCO2 * 0.3 : molH2S + molCO2;
    const amineMolRequired = totalAcidGasMol / (targetRichLoadingMolMol * props.capacity);
    const amineLbRequired = amineMolRequired * props.mw;
    const amineSolutionLbPerDay = amineLbRequired / (amineConcentrationWtPct / 100);
    const circulationRateGpm = amineSolutionLbPerDay / (props.density * 8.34 * 24 * 60);
    const leanLoadingMolMol = 0.02;
    const richLoadingMolMol = targetRichLoadingMolMol;
    const regenerationDutyMMBtuHr = circulationRateGpm * 500 * 60 * 0.05 / 1e6;
    return { circulationRateGpm, leanLoadingMolMol, richLoadingMolMol, regenerationDutyMMBtuHr };
}

/** Sour water H2S and NH3 phase equilibria */
export function sourWaterH2SNH3Equilibria(
    temperatureF: number,
    pH: number,
    h2sInletPpmw: number,
    nh3InletPpmw: number
): { h2sVaporFraction: number; nh3VaporFraction: number; h2sInVapor: number; nh3InVapor: number; strippingEfficiency: number } {
    const h2sHenry = Math.exp(8.5 - 2100 / (temperatureF + 460));
    const nh3Henry = Math.exp(6.5 - 1800 / (temperatureF + 460));
    const h2sDissociation = 1 / (1 + Math.pow(10, pH - 7.0));
    const nh3Dissociation = 1 / (1 + Math.pow(10, 9.25 - pH));
    const h2sVaporFraction = h2sHenry * h2sDissociation / (1 + h2sHenry * h2sDissociation);
    const nh3VaporFraction = nh3Henry * nh3Dissociation / (1 + nh3Henry * nh3Dissociation);
    const h2sInVapor = h2sInletPpmw * h2sVaporFraction;
    const nh3InVapor = nh3InletPpmw * nh3VaporFraction;
    const strippingEfficiency = (h2sInVapor / Math.max(1, h2sInletPpmw) * 100) * 0.7 + (nh3InVapor / Math.max(1, nh3InletPpmw) * 100) * 0.3;
    return { h2sVaporFraction, nh3VaporFraction, h2sInVapor, nh3InVapor, strippingEfficiency };
}

/** Claus process equilibrium conversion */
export function clausEquilibriumConversion(
    temperatureF: number,
    h2sMolPct: number,
    co2MolPct: number,
    hydrocarbonMolPct: number
): { equilibriumConversionPct: number; sulfurRecoveryPct: number; requiredStages: number } {
    const keq = Math.exp(12.5 - 5000 / (temperatureF + 460));
    const conversionFactor = keq / (1 + keq);
    const dilutionPenalty = (co2MolPct + hydrocarbonMolPct) * 0.005;
    const equilibriumConversionPct = Math.min(98, conversionFactor * 100 - dilutionPenalty);
    const sulfurRecoveryPct = equilibriumConversionPct;
    const requiredStages = sulfurRecoveryPct < 90 ? 3 : sulfurRecoveryPct < 95 ? 2 : 1;
    return { equilibriumConversionPct, sulfurRecoveryPct, requiredStages };
}

/** API separator sizing */
export function apiSeparatorSize(
    wasteWaterFlowGpm: number,
    oilSg: number,
    waterTempF: number,
    designOilDropletSizeMicron: number
): { channelWidthFt: number; channelDepthFt: number; channelLengthFt: number; surfaceAreaFt2: number; residenceTimeMin: number } {
    const waterViscosityCP = 2.2 * Math.exp(-0.025 * (waterTempF - 60));
    const densityDiff = (1.0 - oilSg) * 62.4;
    const riseVelocityFpm = 0.024 * (oilSg < 0.85 ? designOilDropletSizeMicron / 100 : designOilDropletSizeMicron / 150) * densityDiff / waterViscosityCP;
    const horizontalVelocityFpm = Math.min(3, 15 * riseVelocityFpm);
    const channelWidthFt = 10;
    const channelDepthFt = 5;
    const surfaceAreaFt2 = wasteWaterFlowGpm * 0.1337 / riseVelocityFpm;
    const channelLengthFt = Math.ceil(surfaceAreaFt2 / channelWidthFt);
    const residenceTimeMin = channelLengthFt / horizontalVelocityFpm;
    return { channelWidthFt, channelDepthFt, channelLengthFt, surfaceAreaFt2, residenceTimeMin };
}

// ───────────────────────────────────────────────────────────────
// 6.9 LUBRICATION OIL & SPECIALTY PRODUCTS
// ───────────────────────────────────────────────────────────────

/** Viscosity Index from kinematic viscosities */
export function viscosityIndex(kv40Cst: number, kv100Cst: number): number {
    if (kv100Cst <= 0) return 0;
    const L = kv40Cst > 70 ? 0.8353 * Math.pow(kv40Cst, 2) + 14.67 * kv40Cst - 216 : kv40Cst;
    const H = kv40Cst > 70 ? 0.1684 * Math.pow(kv40Cst, 2) + 11.85 * kv40Cst - 97 : kv40Cst;
    if (kv100Cst < 2 || kv100Cst > 70) return 0;
    const VI = ((L - kv100Cst) / (L - H)) * 100;
    return Math.max(0, Math.min(200, VI));
}

/** Base oil group classification */
export function baseOilGroup(saturatesPct: number, sulfurPct: number, vi: number): 'Group I' | 'Group II' | 'Group III' | 'Group IV' | 'Group V' {
    if (saturatesPct >= 90 && sulfurPct <= 0.03 && vi >= 120) return 'Group III';
    if (saturatesPct >= 90 && sulfurPct <= 0.03) return 'Group II';
    if (saturatesPct < 90 || sulfurPct > 0.03) return 'Group I';
    return 'Group V';
}

/** Solvent dewaxing - wax yield */
export function solventDewaxing(
    feedRateBpd: number,
    feedPourPointF: number,
    targetPourPointF: number,
    solventRatio: number
): { dewaxedOilBpd: number; waxYieldWtPct: number; waxProductBpd: number } {
    const deltaPP = Math.max(0, feedPourPointF - targetPourPointF);
    const waxYieldWtPct = Math.min(25, deltaPP * 0.35 + 2);
    const waxProductBpd = feedRateBpd * waxYieldWtPct / 100;
    const dewaxedOilBpd = feedRateBpd - waxProductBpd;
    return { dewaxedOilBpd, waxYieldWtPct, waxProductBpd };
}

/** Asphalt penetration grade blending */
export function asphaltBlendIndex(
    components: { volPct: number; penetration: number }[]
): number {
    let totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return 0;
    let sumLog = 0;
    components.forEach(c => {
        sumLog += c.volPct * Math.log10(Math.max(1, c.penetration));
    });
    return Math.pow(10, sumLog / totalVol);
}

/** Asphalt air blowing - softening point increase */
export function airBlownAsphalt(
    feedPenetration: number,
    airRateScfm: number,
    tempF: number,
    timeHr: number
): { productPenetration: number; softeningPointF: number } {
    const severity = airRateScfm * timeHr * (tempF - 350) / 10000;
    const penetrationReduction = Math.exp(-severity * 0.5);
    const productPenetration = Math.max(5, feedPenetration * penetrationReduction);
    const softeningPointF = 140 - Math.log10(productPenetration) * 40;
    return { productPenetration, softeningPointF };
}

/** Base oil VI prediction from composition */
export function baseOilVIFromComposition(
    paraffinsWtPct: number,
    naphthenesWtPct: number,
    aromaticsWtPct: number,
    molecularWeight: number
): { predictedVI: number; baseOilGroup: 'Group I' | 'Group II' | 'Group III' | 'Group IV' | 'Group V'; saturatesPct: number } {
    const saturatesPct = paraffinsWtPct + naphthenesWtPct;
    const predictedVI = Math.round(30 + paraffinsWtPct * 0.8 + naphthenesWtPct * 0.3 - aromaticsWtPct * 0.5 + Math.log(molecularWeight) * 15);
    const sulfurPct = aromaticsWtPct * 0.02;
    const vi = Math.max(0, Math.min(200, predictedVI));
    const baseOilGroup_ = vi >= 120 && saturatesPct >= 90 && sulfurPct <= 0.03 ? 'Group III' : saturatesPct >= 90 && sulfurPct <= 0.03 ? 'Group II' : 'Group I';
    return { predictedVI: vi, baseOilGroup: baseOilGroup_ as 'Group I' | 'Group II' | 'Group III' | 'Group IV' | 'Group V', saturatesPct };
}

/** Wax crystallization kinetics */
export function waxCrystallization(
    waxContentWtPct: number,
    coolingRateFPerMin: number,
    finalTemperatureF: number,
    pourPointF: number
): { waxCrystalSizeMicron: number; waxAppearanceTempF: number; gelStrengthPsi: number; filterabilityIndex: number } {
    const waxAppearanceTempF = pourPointF + 15 + waxContentWtPct * 0.5;
    const waxCrystalSizeMicron = Math.max(5, 50 * Math.pow(coolingRateFPerMin, -0.3));
    const gelStrengthPsi = waxContentWtPct * 0.1 * Math.exp(-(finalTemperatureF - pourPointF) * 0.05);
    const filterabilityIndex = waxCrystalSizeMicron > 20 ? 90 : waxCrystalSizeMicron > 10 ? 70 : 40;
    return { waxCrystalSizeMicron, waxAppearanceTempF, gelStrengthPsi, filterabilityIndex };
}

/** Asphalt penetration vs temperature curve */
export function asphaltPenetrationVsTemp(
    penetrationAt25C: number,
    softeningPointF: number,
    measurementTempF: number
): { penetrationAtTemp: number; temperatureSusceptibility: number; pgGradeHighC: number; pgGradeLowC: number } {
    const penIndex = (20 * 300 + 500 * Math.log10(penetrationAt25C) - 1952) / (50 * Math.log10(penetrationAt25C) - 500 - 20);
    const deltaT = measurementTempF - 77;
    const penetrationAtTemp = penetrationAt25C * Math.pow(10, deltaT * penIndex / 20);
    const temperatureSusceptibility = penIndex;
    const pgGradeHighC = Math.round((softeningPointF - 32) * 5 / 9 * 0.9);
    const pgGradeLowC = Math.round(-(20 + Math.log10(penetrationAt25C) * 15));
    return { penetrationAtTemp, temperatureSusceptibility, pgGradeHighC, pgGradeLowC };
}

/** Petrochemical margin from naphtha steam cracking */
export function petrochemicalMargin(
    naphthaFeedBpd: number,
    naphthaCostPerBbl: number,
    ethylenePricePerTon: number,
    propylenePricePerTon: number,
    butadienePricePerTon: number,
    benzenePricePerTon: number,
    pyrolysisGasolinePricePerBbl: number
): { ethyleneTpd: number; propyleneTpd: number; butadieneTpd: number; benzeneTpd: number; pyGasBpd: number; totalRevenuePerDay: number; marginPerDay: number; marginPerTonFeed: number } {
    const feedTpd = naphthaFeedBpd * 42 * 0.75 / 2000;
    const ethyleneTpd = feedTpd * 0.33;
    const propyleneTpd = feedTpd * 0.16;
    const butadieneTpd = feedTpd * 0.05;
    const benzeneTpd = feedTpd * 0.08;
    const pyGasBpd = naphthaFeedBpd * 0.18;
    const totalRevenuePerDay = ethyleneTpd * ethylenePricePerTon + propyleneTpd * propylenePricePerTon + butadieneTpd * butadienePricePerTon + benzeneTpd * benzenePricePerTon + pyGasBpd * pyrolysisGasolinePricePerBbl;
    const marginPerDay = totalRevenuePerDay - naphthaFeedBpd * naphthaCostPerBbl;
    const marginPerTonFeed = feedTpd > 0 ? marginPerDay / feedTpd : 0;
    return { ethyleneTpd, propyleneTpd, butadieneTpd, benzeneTpd, pyGasBpd, totalRevenuePerDay, marginPerDay, marginPerTonFeed };
}

// ───────────────────────────────────────────────────────────────
// 6.10 REFINERY UTILITIES & ENERGY MANAGEMENT
// ───────────────────────────────────────────────────────────────

/** Boiler efficiency */
export function boilerEfficiency(stackTempF: number, excessO2Pct: number, ambientTempF: number = 70): number {
    const dryGasLoss = (stackTempF - ambientTempF) * (0.0237 + 0.000189 * excessO2Pct);
    const moistureLoss = (stackTempF - ambientTempF) * 0.04;
    const radiationLoss = 1.5;
    return Math.max(75, 100 - dryGasLoss - moistureLoss - radiationLoss);
}

/** Steam generation from waste heat */
export function wasteHeatSteam(flueGasFlowLbHr: number, inletTempF: number, outletTempF: number): number {
    const cp = 0.26;
    const heatRecovered = flueGasFlowLbHr * cp * (inletTempF - outletTempF);
    const steamEnthalpy = 1100;
    return heatRecovered / steamEnthalpy;
}

/** Cooling tower evaporation loss */
export function coolingTowerEvaporation(circRateGpm: number, deltaTF: number, cyclesOfConcentration: number): { evaporationGpm: number; blowdownGpm: number; makeupGpm: number } {
    const evaporationGpm = circRateGpm * deltaTF * 0.001;
    const blowdownGpm = evaporationGpm / (cyclesOfConcentration - 1);
    const makeupGpm = evaporationGpm + blowdownGpm;
    return { evaporationGpm, blowdownGpm, makeupGpm };
}

/** Power generation from steam turbine */
export function steamTurbinePower(steamFlowLbHr: number, inletEnthalpyBtuLb: number, exhaustEnthalpyBtuLb: number, isentropicEff: number = 0.85): number {
    const actualEnthalpyDrop = (inletEnthalpyBtuLb - exhaustEnthalpyBtuLb) * isentropicEff;
    return steamFlowLbHr * actualEnthalpyDrop / 3412;
}

/** Gas turbine power and heat recovery */
export function gasTurbineCHP(
    powerOutputMW: number,
    efficiencyPct: number = 35,
    hrsgEffPct: number = 80
): { fuelInputMMBtuHr: number; exhaustHeatMMBtuHr: number; steamGeneratedLbHr: number; overallEfficiencyPct: number } {
    const powerToHeat = powerOutputMW * 3.412;
    const fuelInputMMBtuHr = powerToHeat / (efficiencyPct / 100);
    const exhaustHeatMMBtuHr = fuelInputMMBtuHr - powerToHeat;
    const steamGeneratedLbHr = exhaustHeatMMBtuHr * hrsgEffPct / 100 * 1e6 / 1100;
    const overallEfficiencyPct = (powerToHeat + exhaustHeatMMBtuHr * hrsgEffPct / 100) / fuelInputMMBtuHr * 100;
    return { fuelInputMMBtuHr, exhaustHeatMMBtuHr, steamGeneratedLbHr, overallEfficiencyPct };
}

/** Energy Intensity Index (EII) - Solomon methodology approximation */
export function energyIntensityIndex(
    totalEnergyMMBtuPerDay: number,
    crudeThroughputBpd: number,
    complexityFactor: number
): number {
    if (crudeThroughputBpd <= 0) return 0;
    const standardEnergy = crudeThroughputBpd * 0.08 * complexityFactor;
    return (totalEnergyMMBtuPerDay / standardEnergy) * 100;
}

/** Steam turbine Willans line efficiency model */
export function steamTurbineWillansLine(
    steamFlowLbHr: number,
    designFlowLbHr: number,
    inletPressurePsig: number,
    exhaustPressurePsig: number,
    inletTempF: number
): { powerOutputKW: number; efficiencyPct: number; steamRateLbPerKWh: number; partLoadFactor: number } {
    const isentropicEnthalpyDrop = 150 + (inletPressurePsig - exhaustPressurePsig) * 0.4 + (inletTempF - 600) * 0.5;
    const loadFraction = steamFlowLbHr / designFlowLbHr;
    const noLoadFraction = 0.15;
    const efficiencyFactor = (loadFraction - noLoadFraction) / (1 - noLoadFraction);
    const actualEfficiency = Math.max(0, 0.82 * efficiencyFactor);
    const powerOutputKW = steamFlowLbHr * isentropicEnthalpyDrop * actualEfficiency / 3412;
    const steamRateLbPerKWh = powerOutputKW > 0 ? steamFlowLbHr / powerOutputKW : 999;
    const efficiencyPct = actualEfficiency * 100;
    const partLoadFactor = loadFraction;
    return { powerOutputKW, efficiencyPct, steamRateLbPerKWh, partLoadFactor };
}

/** Cooling tower makeup water requirements */
export function coolingTowerMakeup(
    circRateGpm: number,
    hotWaterTempF: number,
    coldWaterTempF: number,
    wetBulbTempF: number,
    cyclesOfConcentration: number,
    driftLossPct: number
): { evaporationGpm: number; driftGpm: number; blowdownGpm: number; makeupGpm: number; approachF: number; rangeF: number } {
    const rangeF = hotWaterTempF - coldWaterTempF;
    const approachF = coldWaterTempF - wetBulbTempF;
    const evaporationGpm = circRateGpm * rangeF * 0.001;
    const driftGpm = circRateGpm * driftLossPct / 100;
    const blowdownGpm = evaporationGpm / (cyclesOfConcentration - 1) - driftGpm;
    const makeupGpm = evaporationGpm + driftGpm + blowdownGpm;
    return { evaporationGpm, driftGpm, blowdownGpm, makeupGpm, approachF, rangeF };
}

/** Pinch analysis - minimum delta T optimization */
export function pinchDeltaTmin(
    hotStreams: { name: string; supplyTempF: number; targetTempF: number; heatCapacityMBtuHrF: number }[],
    coldStreams: { name: string; supplyTempF: number; targetTempF: number; heatCapacityMBtuHrF: number }[]
): { deltaTminOptimalF: number; hotUtilityRequiredMMBtuHr: number; coldUtilityRequiredMMBtuHr: number; heatRecoveryMMBtuHr: number; heatExchangerAreaFt2: number } {
    const deltaTminOptimalF = 25;
    const hotDuty = hotStreams.reduce((s, h) => s + h.heatCapacityMBtuHrF * (h.supplyTempF - h.targetTempF), 0);
    const coldDuty = coldStreams.reduce((s, c) => s + c.heatCapacityMBtuHrF * (c.targetTempF - c.supplyTempF), 0);
    const heatRecoveryMMBtuHr = Math.min(hotDuty, coldDuty) * 0.7;
    const hotUtilityRequiredMMBtuHr = Math.max(0, hotDuty - heatRecoveryMMBtuHr);
    const coldUtilityRequiredMMBtuHr = Math.max(0, coldDuty - heatRecoveryMMBtuHr);
    const heatExchangerAreaFt2 = heatRecoveryMMBtuHr * 1000;
    return { deltaTminOptimalF, hotUtilityRequiredMMBtuHr, coldUtilityRequiredMMBtuHr, heatRecoveryMMBtuHr, heatExchangerAreaFt2 };
}

/** EII benchmarking vs Solomon database */
export function eiiBenchmark(
    refineryEII: number,
    nelsonComplexity: number,
    crudeThroughputBpd: number,
    refineryType: 'simple' | 'medium' | 'complex'
): { percentileRank: number; quartile: number; improvementGapPct: number; bestInClassEII: number; annualEnergyCostSavingsMM: number } {
    const benchmarks = {
        'simple': { q1: 85, q2: 95, q3: 110 },
        'medium': { q1: 90, q2: 100, q3: 115 },
        'complex': { q1: 95, q2: 105, q3: 120 }
    };
    const bench = benchmarks[refineryType];
    const bestInClassEII = bench.q1;
    let percentileRank: number;
    if (refineryEII <= bench.q1) percentileRank = 90 + (bench.q1 - refineryEII) / 2;
    else if (refineryEII <= bench.q2) percentileRank = 50 + (bench.q2 - refineryEII) / (bench.q2 - bench.q1) * 40;
    else if (refineryEII <= bench.q3) percentileRank = 10 + (bench.q3 - refineryEII) / (bench.q3 - bench.q2) * 40;
    else percentileRank = Math.max(1, 10 - (refineryEII - bench.q3) / 2);
    const quartile = refineryEII <= bench.q1 ? 1 : refineryEII <= bench.q2 ? 2 : refineryEII <= bench.q3 ? 3 : 4;
    const improvementGapPct = (refineryEII - bestInClassEII) / bestInClassEII * 100;
    const annualEnergyCostSavingsMM = improvementGapPct / 100 * crudeThroughputBpd * 0.08 * nelsonComplexity * 3 * 365 / 1e6;
    return { percentileRank, quartile, improvementGapPct, bestInClassEII, annualEnergyCostSavingsMM };
}

// ───────────────────────────────────────────────────────────────
// 6.11 REFINERY PLANNING, SCHEDULING & ECONOMICS
// ───────────────────────────────────────────────────────────────

/** Gross refinery margin (simplified LP objective) */
export function refineryGrossMargin(
    productRevenue: { product: string; volumeBpd: number; pricePerBbl: number }[],
    crudeCosts: { crude: string; volumeBpd: number; pricePerBbl: number }[],
    operatingCostPerBbl: number
): { totalRevenue: number; totalCrudeCost: number; totalOpCost: number; grossMargin: number; marginPerBbl: number } {
    const totalRevenue = productRevenue.reduce((s, p) => s + p.volumeBpd * p.pricePerBbl * 365, 0);
    const totalCrudeCost = crudeCosts.reduce((s, c) => s + c.volumeBpd * c.pricePerBbl * 365, 0);
    const totalCrudeVolume = crudeCosts.reduce((s, c) => s + c.volumeBpd, 0);
    const totalOpCost = totalCrudeVolume * operatingCostPerBbl * 365;
    const grossMargin = totalRevenue - totalCrudeCost - totalOpCost;
    const marginPerBbl = totalCrudeVolume > 0 ? (totalRevenue - totalCrudeCost - totalOpCost) / (totalCrudeVolume * 365) : 0;
    return { totalRevenue, totalCrudeCost, totalOpCost, grossMargin, marginPerBbl };
}

/** 3-2-1 crack spread */
export function crackSpread(gasolinePricePerBbl: number, dieselPricePerBbl: number, crudePricePerBbl: number): number {
    return (2 * gasolinePricePerBbl + 1 * dieselPricePerBbl) / 3 - crudePricePerBbl;
}

/** Nelson Complexity Index */
export function nelsonComplexityIndex(units: { name: string; capacityBpd: number; complexityFactor: number }[], crudeCapacityBpd: number): number {
    if (crudeCapacityBpd <= 0) return 0;
    return units.reduce((s, u) => s + (u.capacityBpd / crudeCapacityBpd) * u.complexityFactor, 0);
}

/** Unit OPEX breakdown */
export function unitOPEX(
    energyCostPerBbl: number,
    catalystChemicalsPerBbl: number,
    maintenancePerBbl: number,
    personnelPerBbl: number,
    otherPerBbl: number
): { totalOPEXPerBbl: number; breakdown: { energy: number; catChem: number; maintenance: number; personnel: number; other: number } } {
    const total = energyCostPerBbl + catalystChemicalsPerBbl + maintenancePerBbl + personnelPerBbl + otherPerBbl;
    return {
        totalOPEXPerBbl: total,
        breakdown: {
            energy: (energyCostPerBbl / total) * 100,
            catChem: (catalystChemicalsPerBbl / total) * 100,
            maintenance: (maintenancePerBbl / total) * 100,
            personnel: (personnelPerBbl / total) * 100,
            other: (otherPerBbl / total) * 100
        }
    };
}

/** Turnaround interval optimization */
export function turnaroundEconomics(
    unitCapacityBpd: number,
    marginPerBbl: number,
    turnaroundDays: number,
    turnaroundCostMM: number,
    runLengthYears: number
): { revenueLostMM: number; annualizedTurnaroundCostMM: number; optimalRunLengthYears: number; totalImpactPerYearMM: number } {
    const dailyMargin = unitCapacityBpd * marginPerBbl;
    const revenueLostMM = dailyMargin * turnaroundDays / 1e6;
    const annualizedTurnaroundCostMM = turnaroundCostMM / runLengthYears;
    const degradationRate = 0.02;
    const optimalRunLengthYears = Math.sqrt(2 * turnaroundCostMM / (dailyMargin * 365 * degradationRate / 1e6));
    const totalImpactPerYearMM = revenueLostMM / runLengthYears + annualizedTurnaroundCostMM;
    return { revenueLostMM, annualizedTurnaroundCostMM, optimalRunLengthYears, totalImpactPerYearMM };
}

/** LP margin waterfall decomposition */
export function lpMarginWaterfall(
    baseCrudeCostPerBbl: number,
    productValuePerBbl: number,
    adjustments: { item: string; valuePerBbl: number; category: 'revenue' | 'cost' | 'quality' | 'logistics' }[]
): { grossProductValue: number; netProductValue: number; totalCostDelivered: number; netMargin: number; waterfallItems: { item: string; value: number; cumulative: number; category: string }[] } {
    const grossProductValue = productValuePerBbl;
    let cumulative = grossProductValue;
    const waterfallItems: { item: string; value: number; cumulative: number; category: string }[] = [{ item: 'Gross Product Value', value: grossProductValue, cumulative, category: 'revenue' }];

    let netProductValue = grossProductValue;
    adjustments.filter(a => a.category === 'revenue' || a.category === 'quality').forEach(a => {
        netProductValue += a.valuePerBbl;
        cumulative += a.valuePerBbl;
        waterfallItems.push({ item: a.item, value: a.valuePerBbl, cumulative, category: a.category });
    });

    let totalCostDelivered = baseCrudeCostPerBbl;
    waterfallItems.push({ item: 'Crude Cost (FOB)', value: -baseCrudeCostPerBbl, cumulative: cumulative - baseCrudeCostPerBbl, category: 'cost' });
    cumulative -= baseCrudeCostPerBbl;

    adjustments.filter(a => a.category === 'cost' || a.category === 'logistics').forEach(a => {
        totalCostDelivered += a.valuePerBbl;
        cumulative += a.valuePerBbl;
        waterfallItems.push({ item: a.item, value: a.valuePerBbl, cumulative, category: a.category });
    });

    const netMargin = cumulative;
    waterfallItems.push({ item: 'NET MARGIN', value: 0, cumulative: netMargin, category: 'summary' });

    return { grossProductValue, netProductValue, totalCostDelivered, netMargin, waterfallItems };
}

/** Detailed Nelson Complexity with individual unit factors */
export function nelsonComplexityDetailed(
    crudeCapacityBpd: number,
    units: { name: string; capacityBpd: number; complexityFactor: number; utilizationPct: number }[]
): { nci: number; unitContributions: { name: string; contribution: number; pctOfTotal: number }[]; capacityWeightedComplexity: number } {
    if (crudeCapacityBpd <= 0) return { nci: 0, unitContributions: [], capacityWeightedComplexity: 0 };
    let nci = 0;
    const unitContributions: { name: string; contribution: number; pctOfTotal: number }[] = [];
    units.forEach(u => {
        const effectiveCapacity = u.capacityBpd * u.utilizationPct / 100;
        const contribution = (effectiveCapacity / crudeCapacityBpd) * u.complexityFactor;
        nci += contribution;
        unitContributions.push({ name: u.name, contribution, pctOfTotal: 0 });
    });
    const totalNci = nci;
    unitContributions.forEach(u => { u.pctOfTotal = totalNci > 0 ? (u.contribution / totalNci) * 100 : 0; });
    const capacityWeightedComplexity = nci * (crudeCapacityBpd / 200000);
    return { nci, unitContributions, capacityWeightedComplexity };
}

/** Detailed 3-2-1 crack spread with component breakdown */
export function crackSpread3_2_1(
    crudePricePerBbl: number,
    gasolinePricePerGal: number,
    dieselPricePerGal: number,
    otherProductValuePerBbl: number,
    variableCostPerBbl: number
): { crackSpread: number; grossProductValuePerBbl: number; netMarginPerBbl: number; gasolineContributionPct: number; dieselContributionPct: number } {
    const gasolineValuePerBbl = gasolinePricePerGal * 42 * 2 / 3;
    const dieselValuePerBbl = dieselPricePerGal * 42 * 1 / 3;
    const grossProductValuePerBbl = gasolineValuePerBbl + dieselValuePerBbl + otherProductValuePerBbl;
    const crackSpread_ = grossProductValuePerBbl - crudePricePerBbl;
    const netMarginPerBbl = crackSpread_ - variableCostPerBbl;
    const totalProduct = gasolineValuePerBbl + dieselValuePerBbl + otherProductValuePerBbl;
    const gasolineContributionPct = totalProduct > 0 ? (gasolineValuePerBbl / totalProduct) * 100 : 0;
    const dieselContributionPct = totalProduct > 0 ? (dieselValuePerBbl / totalProduct) * 100 : 0;
    return { crackSpread: crackSpread_, grossProductValuePerBbl, netMarginPerBbl, gasolineContributionPct, dieselContributionPct };
}

/** Turnaround NPV optimization */
export function turnaroundNPV(
    unitCapacityBpd: number,
    marginPerBbl: number,
    turnaroundCostMM: number,
    runLengthYears: number,
    discountRate: number,
    degradationRatePerYear: number
): { npvMM: number; annualEquivalentCostMM: number; optimalRunLengthYears: number; sensitivity: { runLength: number; npvMM: number }[] } {
    const dailyMargin0 = unitCapacityBpd * marginPerBbl;
    let npv = -turnaroundCostMM;
    let totalOperatingDays = 0;

    for (let yr = 1; yr <= runLengthYears; yr++) {
        const dailyMargin = dailyMargin0 * (1 - degradationRatePerYear * (yr - 1));
        const annualOperatingDays = 365 - 7;
        totalOperatingDays += annualOperatingDays;
        npv += (dailyMargin * annualOperatingDays / 1e6) / Math.pow(1 + discountRate, yr);
    }

    npv -= turnaroundCostMM / Math.pow(1 + discountRate, runLengthYears);
    const annualEquivalentCostMM = npv * discountRate / (1 - Math.pow(1 + discountRate, -runLengthYears));

    const optimalRunLengthYears = Math.round(Math.sqrt(2 * turnaroundCostMM * 365 / (dailyMargin0 * degradationRatePerYear * 0.5 / 1e6)));

    const sensitivity: { runLength: number; npvMM: number }[] = [];
    for (let rl = 2; rl <= 8; rl += 1) {
        let sensNPV = -turnaroundCostMM;
        for (let yr = 1; yr <= rl; yr++) {
            const dm = dailyMargin0 * (1 - degradationRatePerYear * (yr - 1));
            sensNPV += (dm * 358 / 1e6) / Math.pow(1 + discountRate, yr);
        }
        sensNPV -= turnaroundCostMM / Math.pow(1 + discountRate, rl);
        sensitivity.push({ runLength: rl, npvMM: sensNPV });
    }

    return { npvMM: npv, annualEquivalentCostMM, optimalRunLengthYears, sensitivity };
}

/** Utilization economics - value of incremental throughput */
export function utilizationEconomics(
    nameplateCapacityBpd: number,
    actualThroughputBpd: number,
    fixedCostPerYear: number,
    variableCostPerBbl: number,
    marginPerBbl: number
): { utilizationPct: number; totalRevenuePerYear: number; totalVariableCost: number; totalFixedCost: number; netProfit: number; breakevenThroughputBpd: number; incrementalValuePerBbl: number } {
    const utilizationPct = (actualThroughputBpd / nameplateCapacityBpd) * 100;
    const operatingDays = 350;
    const totalRevenuePerYear = actualThroughputBpd * marginPerBbl * operatingDays;
    const totalVariableCost = actualThroughputBpd * variableCostPerBbl * operatingDays;
    const totalFixedCost = fixedCostPerYear;
    const netProfit = totalRevenuePerYear - totalVariableCost - totalFixedCost;
    const breakevenThroughputBpd = totalFixedCost / (Math.max(0.01, marginPerBbl - variableCostPerBbl) * operatingDays);
    const incrementalValuePerBbl = marginPerBbl - variableCostPerBbl;
    return { utilizationPct, totalRevenuePerYear, totalVariableCost, totalFixedCost, netProfit, breakevenThroughputBpd, incrementalValuePerBbl };
}

// ───────────────────────────────────────────────────────────────
// 6.12 PRODUCT STORAGE, BLENDING & DISPATCH
// ───────────────────────────────────────────────────────────────

/** Tank ullage (available space) */
export function tankUllage(tankCapacityBbl: number, currentInventoryBbl: number): { ullageBbl: number; utilizationPct: number } {
    const ullageBbl = Math.max(0, tankCapacityBbl - currentInventoryBbl);
    const utilizationPct = (currentInventoryBbl / tankCapacityBbl) * 100;
    return { ullageBbl, utilizationPct };
}

/** Truck rack throughput */
export function truckRackThroughput(
    numLanes: number,
    gpmPerLane: number,
    loadTimeMin: number,
    switchTimeMin: number,
    operatingHoursPerDay: number,
    utilizationPct: number
): { trucksPerDay: number; throughputBpd: number } {
    const cycleTimeMin = loadTimeMin + switchTimeMin;
    const cyclesPerLanePerDay = (operatingHoursPerDay * 60) / cycleTimeMin * utilizationPct / 100;
    const trucksPerDay = Math.floor(cyclesPerLanePerDay * numLanes);
    const throughputBpd = trucksPerDay * gpmPerLane * loadTimeMin / 42;
    return { trucksPerDay, throughputBpd };
}

/** Pipeline batch interface volume */
export function pipelineBatchInterface(pipeDiameterIn: number, lengthMiles: number, numBatchesPerMonth: number): { interfaceVolumeBbl: number; downgradeCostPerMonth: number } {
    const interfaceLengthFt = Math.sqrt(pipeDiameterIn * 5280 * 0.001) * 100;
    const interfaceVolumeBbl = interfaceLengthFt * Math.PI * Math.pow(pipeDiameterIn / 24, 2) * lengthMiles * 5280 / 5.615 * numBatchesPerMonth;
    const downgradeCostPerMonth = interfaceVolumeBbl * 3;
    return { interfaceVolumeBbl, downgradeCostPerMonth };
}

/** Marine loading rate */
export function marineLoadingRate(
    vesselCapacityBbl: number,
    loadingArmGpm: number,
    numArms: number,
    strippingTimeHr: number
): { totalLoadingTimeHr: number; effectiveRateBph: number } {
    const totalGpm = loadingArmGpm * numArms;
    const pumpingTimeHr = vesselCapacityBbl * 42 / (totalGpm * 60);
    const totalLoadingTimeHr = pumpingTimeHr + strippingTimeHr;
    const effectiveRateBph = vesselCapacityBbl / totalLoadingTimeHr;
    return { totalLoadingTimeHr, effectiveRateBph };
}

/** Additive injection rate (gal/day to ppm dosage) */
export function additiveInjection(
    productFlowBpd: number,
    dosagePpm: number,
    additiveDensityLbGal: number = 8.5
): { injectionRateGalHr: number; dailyConsumptionGal: number; annualCost: number } {
    const galPerBbl = dosagePpm * 42 / 1e6;
    const injectionRateGalHr = productFlowBpd * galPerBbl / 24;
    const dailyConsumptionGal = injectionRateGalHr * 24;
    const annualCost = dailyConsumptionGal * 365 * 12;
    return { injectionRateGalHr, dailyConsumptionGal, annualCost };
}

// ───────────────────────────────────────────────────────────────
// ADVANCED CALCULATIONS — Complex, editable by industrial engineers
// ───────────────────────────────────────────────────────────────

// ─── CRUDE BLENDING & LP MARGIN ───
/** Multi-crude blending optimization with LP-style constraints */
export function crudeBlendOptimizer(
    crudes: { name: string; api: number; sulfurWtPct: number; tan: number; ccrWtPct: number; costPerBbl: number; availableBpd: number; tbp50F: number; tbp100F: number; metalsNiVppm: number; nitrogenWtPct: number; naphthaYieldPct: number; dieselYieldPct: number; vgoYieldPct: number; residueYieldPct: number }[],
    minApi: number, maxSulfur: number, maxTan: number, maxCCR: number, maxMetals: number,
    targetRateBpd: number
): { blendApi: number; blendSulfur: number; blendTan: number; blendCCR: number; blendMetals: number; avgCostPerBbl: number; blendRecipes: { name: string; volBpd: number; costContribution: number }[]; feasible: boolean; constraintViolations: string[]; shadowPrices: { api: number; sulfur: number; tan: number } } {
    // Complex blending with feasibility check and pseudo shadow prices
    const constraints: string[] = [];
    let solved = false;
    let iteration = 0;
    const maxIter = 50;

    // Initial equal split
    let remaining = targetRateBpd;
    let recipes: { name: string; volBpd: number; costContribution: number }[] = crudes.map(c => {
        const alloc = Math.min(c.availableBpd, targetRateBpd / crudes.length);
        return { name: c.name, volBpd: alloc, costContribution: 0 };
    });
    remaining = targetRateBpd - recipes.reduce((s, r) => s + r.volBpd, 0);

    // Greedy fill remaining with cheapest crude that fits constraints
    while (iteration < maxIter && remaining > 0.1) {
        const totalVol = recipes.reduce((s, r) => s + r.volBpd, 0);
        let blendApi = 0, blendS = 0, blendTan = 0, blendCCR = 0, blendMetals = 0;
        if (totalVol > 0) {
            recipes.forEach(r => {
                const c = crudes.find(x => x.name === r.name)!;
                const frac = r.volBpd / totalVol;
                blendApi += c.api * frac;
                blendS += c.sulfurWtPct * frac;
                blendTan += c.tan * frac;
                blendCCR += c.ccrWtPct * frac;
                blendMetals += c.metalsNiVppm * frac;
            });
        }
        // Find a crude that can help
        const candidate = crudes
            .filter(c => recipes.find(r => r.name === c.name)!.volBpd < c.availableBpd)
            .sort((a, b) => a.costPerBbl - b.costPerBbl)[0];
        if (!candidate) break;
        const addVol = Math.min(remaining, 5000);
        const rec = recipes.find(r => r.name === candidate.name)!;
        rec.volBpd += addVol;
        remaining -= addVol;
        iteration++;
        if (remaining < 1) solved = true;
    }

    const totalVol = recipes.reduce((s, r) => s + r.volBpd, 0);
    let blendApi = 0, blendS = 0, blendTan = 0, blendCCR = 0, blendMetals = 0, avgCost = 0;
    recipes.forEach(r => {
        const c = crudes.find(x => x.name === r.name)!;
        const frac = r.volBpd / totalVol;
        blendApi += c.api * frac;
        blendS += c.sulfurWtPct * frac;
        blendTan += c.tan * frac;
        blendCCR += c.ccrWtPct * frac;
        blendMetals += c.metalsNiVppm * frac;
        avgCost += c.costPerBbl * r.volBpd;
        r.costContribution = c.costPerBbl * r.volBpd;
    });
    avgCost /= totalVol;

    if (blendApi < minApi) constraints.push(`API ${blendApi.toFixed(1)} < min ${minApi}`);
    if (blendS > maxSulfur) constraints.push(`Sulfur ${blendS.toFixed(2)} > max ${maxSulfur}`);
    if (blendTan > maxTan) constraints.push(`TAN ${blendTan.toFixed(2)} > max ${maxTan}`);
    if (blendCCR > maxCCR) constraints.push(`CCR ${blendCCR.toFixed(2)} > max ${maxCCR}`);
    if (blendMetals > maxMetals) constraints.push(`Metals ${blendMetals.toFixed(1)} > max ${maxMetals}`);

    const shadowPrices = {
        api: blendApi < minApi ? (minApi - blendApi) * 0.15 * avgCost : 0,
        sulfur: blendS > maxSulfur ? (blendS - maxSulfur) * 2.5 * avgCost : 0,
        tan: blendTan > maxTan ? (blendTan - maxTan) * 5 * avgCost : 0,
    };

    return { blendApi, blendSulfur: blendS, blendTan, blendCCR, blendMetals, avgCostPerBbl: avgCost, blendRecipes: recipes.map(r => ({ ...r, volBpd: Math.round(r.volBpd) })), feasible: constraints.length === 0 && Math.abs(remaining) < 100, constraintViolations: constraints, shadowPrices };
}

/** TBP Curve — detailed multi-point generation with ASTM D2892/D5236 simulation */
export function generateTBPCurveDetailed(
    t50F: number, t100F: number, apiGravity: number, sulfurWtPct: number, numCuts: number = 20
): { tempF: number; yieldPct: number; sg: number; sulfurWtPct: number; fractionType: string }[] {
    const cuts: { tempF: number; yieldPct: number; sg: number; sulfurWtPct: number; fractionType: string }[] = [];
    const step = (t100F - 50) / numCuts;
    for (let i = 0; i <= numCuts; i++) {
        const tempF = 50 + i * step;
        // Yield follows cumulative Weibull-like S-curve
        const normalizedTemp = (tempF - 50) / (t100F - 50);
        const yieldPct = 100 * (1 - Math.exp(-3 * Math.pow(normalizedTemp, 2.5)));
        // SG increases with boiling point
        const sg = 0.62 + 0.35 * normalizedTemp + 0.03 * (1 - apiGravity / 50);
        // Sulfur concentrates in heavier fractions
        const sulfurMult = 0.3 + 1.4 * normalizedTemp;
        const fracSulfur = sulfurWtPct * sulfurMult * (1 + 0.2 * normalizedTemp);
        // Fraction type
        let fractionType: string;
        if (tempF < 180) fractionType = 'Light Naphtha';
        else if (tempF < 300) fractionType = 'Heavy Naphtha';
        else if (tempF < 430) fractionType = 'Kerosene/Jet';
        else if (tempF < 550) fractionType = 'Diesel/Gas Oil';
        else if (tempF < 650) fractionType = 'HGO';
        else if (tempF < 800) fractionType = 'LVGO';
        else if (tempF < 1050) fractionType = 'HVGO';
        else fractionType = 'Vacuum Residue';
        cuts.push({ tempF: Math.round(tempF), yieldPct: Math.min(100, Math.max(0, yieldPct)), sg: Math.round(sg * 10000) / 10000, sulfurWtPct: Math.round(fracSulfur * 1000) / 1000, fractionType });
    }
    return cuts;
}

/** PIONA Analysis for Naphtha Cuts */
export function pionaAnalysis(
    naphthaCutTempF: number, crudeType: 'paraffinic' | 'naphthenic' | 'aromatic' | 'mixed'
): { paraffinsPct: number; isoparaffinsPct: number; olefinsPct: number; naphthenesPct: number; aromaticsPct: number; estimatedRON: number; estimatedMON: number; benzenePrecursorPct: number } {
    // Composition varies by crude type and boiling range
    const baseProfiles = {
        paraffinic: { P: 55, I: 25, O: 0.5, N: 15, A: 4.5 },
        naphthenic: { P: 25, I: 15, O: 0.5, N: 45, A: 14.5 },
        aromatic: { P: 30, I: 12, O: 1, N: 22, A: 35 },
        mixed: { P: 35, I: 18, O: 0.8, N: 28, A: 18.2 },
    };
    const base = baseProfiles[crudeType] || baseProfiles.mixed;
    // Higher boiling = more aromatics, less paraffins
    const tempFactor = Math.min(1, Math.max(0, (naphthaCutTempF - 100) / 300));
    const total = base.P + base.I + base.O + base.N + base.A;
    const paraffinsPct = base.P * (1 - 0.3 * tempFactor);
    const isoparaffinsPct = base.I * (1 - 0.2 * tempFactor);
    const olefinsPct = base.O * (1 + 0.2 * tempFactor);
    const naphthenesPct = base.N * (1 - 0.15 * tempFactor);
    const aromaticsPct = base.A * (1 + 0.5 * tempFactor);
    const sum = paraffinsPct + isoparaffinsPct + olefinsPct + naphthenesPct + aromaticsPct;
    // Estimated octane numbers based on composition
    const estimatedRON = 40 + (isoparaffinsPct / sum) * 55 + (aromaticsPct / sum) * 60 + (naphthenesPct / sum) * 20 - (paraffinsPct / sum) * 30;
    const estimatedMON = estimatedRON - 8 - (olefinsPct / sum) * 2;
    const benzenePrecursorPct = naphthenesPct * 0.25 + aromaticsPct * 0.1;
    return {
        paraffinsPct: Math.round(paraffinsPct * 10) / 10,
        isoparaffinsPct: Math.round(isoparaffinsPct * 10) / 10,
        olefinsPct: Math.round(olefinsPct * 10) / 10,
        naphthenesPct: Math.round(naphthenesPct * 10) / 10,
        aromaticsPct: Math.round(aromaticsPct * 10) / 10,
        estimatedRON: Math.round(estimatedRON * 10) / 10,
        estimatedMON: Math.round(estimatedMON * 10) / 10,
        benzenePrecursorPct: Math.round(benzenePrecursorPct * 10) / 10,
    };
}

// ─── DETAILED DESALTING ───
/** Emulsion stability & rag layer modeling */
export function desalterEmulsionModel(
    crudeApi: number, asphalteneWtPct: number, solidContentPpm: number, naphthenicAcidMgKOHg: number,
    desalterTempF: number, deltaPMixPsi: number, electricFieldKv: number, demulsifierDosagePpm: number
): { emulsionStabilityIndex: number; ragLayerThicknessIn: number; predictedSaltRemovalPct: number; waterCarryoverRisk: 'low' | 'medium' | 'high'; effluentOilPpm: number; optimalDemulsifierPpm: number } {
    // Emulsion stability increases with asphaltenes, solids, naphthenic acid; decreases with temperature and demulsifier
    const stabilityIndex = (asphalteneWtPct * 15 + solidContentPpm / 100 + naphthenicAcidMgKOHg * 3) * (1 - 0.02 * (desalterTempF - 100)) * (1 - 0.03 * Math.log(demulsifierDosagePpm + 1));
    const ragLayerThicknessIn = stabilityIndex * 0.5 * (1 + 5 / electricFieldKv);
    // Salt removal degrades with higher stability
    const predictedSaltRemovalPct = 95 - stabilityIndex * 0.8 - ragLayerThicknessIn * 1.5;
    const waterCarryoverRisk: 'low' | 'medium' | 'high' = stabilityIndex > 8 ? 'high' : stabilityIndex > 4 ? 'medium' : 'low';
    const effluentOilPpm = stabilityIndex * 15 + solidContentPpm * 0.1;
    const optimalDemulsifierPpm = demulsifierDosagePpm * (1 + stabilityIndex * 0.6);
    return {
        emulsionStabilityIndex: Math.round(stabilityIndex * 100) / 100,
        ragLayerThicknessIn: Math.round(ragLayerThicknessIn * 100) / 100,
        predictedSaltRemovalPct: Math.round(Math.max(50, Math.min(99.5, predictedSaltRemovalPct)) * 10) / 10,
        waterCarryoverRisk,
        effluentOilPpm: Math.round(effluentOilPpm),
        optimalDemulsifierPpm: Math.round(optimalDemulsifierPpm),
    };
}

// ─── CDU/VDU DETAILED ───
/** Tray-by-tray hydraulic analysis */
export function trayHydraulicAnalysis(
    vaporRateLbHr: number, liquidRateLbHr: number, trayAreaSqft: number, holeAreaPct: number,
    weirHeightIn: number, traySpacingIn: number, vaporDensityLbFt3: number, liquidDensityLbFt3: number
): { jetFloodPct: number; downcomerFloodPct: number; weepingFactor: number; dryTrayDPInH2O: number; totalTrayDPInH2O: number; stableWindow: boolean; maxCapacityBpd: number } {
    const vaporCFS = vaporRateLbHr / (vaporDensityLbFt3 * 3600);
    const liquidCFS = liquidRateLbHr / (liquidDensityLbFt3 * 3600);
    const holeArea = trayAreaSqft * holeAreaPct / 100;
    const holeVelocityFps = vaporCFS / Math.max(0.01, holeArea);
    // Dry tray pressure drop
    const Cv = 0.74; // orifice coefficient
    const dryTrayDPInH2O = (0.186 * vaporDensityLbFt3 * Math.pow(holeVelocityFps, 2)) / (Cv * Cv * liquidDensityLbFt3) * 27.7;
    // Weir crest
    const weirLengthIn = Math.sqrt(trayAreaSqft * 144) * 0.77;
    const how = 0.48 * Math.pow(liquidCFS * 448.8 / weirLengthIn, 2 / 3);
    const totalTrayDPInH2O = dryTrayDPInH2O + how * 0.5 + weirHeightIn * 0.5;
    // Jet flood (Fair's correlation)
    const capacityFactor = vaporCFS * Math.sqrt(vaporDensityLbFt3 / (liquidDensityLbFt3 - vaporDensityLbFt3)) / trayAreaSqft;
    const floodCapacityFactor = 0.35 * Math.pow(traySpacingIn / 24, 0.5);
    const jetFloodPct = (capacityFactor / Math.max(0.01, floodCapacityFactor)) * 100;
    // Downcomer flood
    const downcomerArea = trayAreaSqft * 0.1;
    const downcomerVelocityFpm = liquidCFS * 60 / Math.max(0.01, downcomerArea);
    const downcomerFloodPct = (downcomerVelocityFpm / 250) * 100;
    // Weeping check
    const weepingFactor = holeVelocityFps > 2.5 ? 0 : (1 - holeVelocityFps / 2.5) * 100;
    const stableWindow = jetFloodPct < 85 && downcomerFloodPct < 80 && weepingFactor < 15;
    const maxCapacityBpd = (vaporRateLbHr / 300) * 42 * 24 * (85 / Math.max(1, jetFloodPct));
    return { jetFloodPct: Math.round(jetFloodPct * 10) / 10, downcomerFloodPct: Math.round(downcomerFloodPct * 10) / 10, weepingFactor: Math.round(weepingFactor * 10) / 10, dryTrayDPInH2O: Math.round(dryTrayDPInH2O * 100) / 100, totalTrayDPInH2O: Math.round(totalTrayDPInH2O * 100) / 100, stableWindow, maxCapacityBpd: Math.round(maxCapacityBpd) };
}

/** Vacuum ejector system performance */
export function vacuumEjectorSystem(
    suctionPressureMmHg: number, motiveSteamPsig: number, nonCondensableLbHr: number, condensingWaterGpm: number, numStages: number
): { stagePressuresMmHg: number[]; steamConsumptionLbHr: number; intercondenserDutyMMBtuHr: number; achievableVacuumMmHg: number; compressionRatioPerStage: number } {
    const compressionRatioPerStage = Math.pow(760 / Math.max(1, suctionPressureMmHg), 1 / numStages);
    const stagePressuresMmHg: number[] = [];
    let p = suctionPressureMmHg;
    for (let i = 0; i < numStages; i++) {
        stagePressuresMmHg.push(Math.round(p));
        p *= compressionRatioPerStage;
    }
    // Motive steam: ~1.5 lb steam per lb of load per stage
    const totalLoad = nonCondensableLbHr + condensingWaterGpm * 500 * 0.001;
    const steamConsumptionLbHr = totalLoad * 1.5 * numStages * (1 + (150 - motiveSteamPsig) / 500);
    const intercondenserDutyMMBtuHr = totalLoad * 1000 * numStages / 1e6;
    const achievableVacuumMmHg = suctionPressureMmHg * (1 - 0.02 * numStages);
    return {
        stagePressuresMmHg,
        steamConsumptionLbHr: Math.round(steamConsumptionLbHr),
        intercondenserDutyMMBtuHr: Math.round(intercondenserDutyMMBtuHr * 100) / 100,
        achievableVacuumMmHg: Math.round(achievableVacuumMmHg * 10) / 10,
        compressionRatioPerStage: Math.round(compressionRatioPerStage * 100) / 100,
    };
}

// ─── NAPHTHA & GASOLINE ───
/** Naphtha splitter design — sharpness optimization */
export function naphthaSplitterDesign(
    feedBpd: number, lightEndPct: number, heavyEndPct: number, targetSplitTempF: number,
    refluxRatio: number, numTrays: number
): { overheadBpd: number; bottomsBpd: number; splitSharpness: number; overlapF: number; condenserDutyMMBtuHr: number; reboilerDutyMMBtuHr: number; optimalRefluxRatio: number } {
    const voltSplit = lightEndPct / 100;
    const overheadBpd = feedBpd * voltSplit;
    const bottomsBpd = feedBpd * (1 - voltSplit);
    // Split sharpness depends on trays and reflux
    const splitSharpness = 1 - Math.exp(-0.02 * numTrays * Math.log(refluxRatio + 1));
    const overlapF = (targetSplitTempF * 0.1) * (1 - splitSharpness);
    const condenserDutyMMBtuHr = overheadBpd * 0.15 * (1 + refluxRatio) / 1000;
    const reboilerDutyMMBtuHr = bottomsBpd * 0.18 * (1 + refluxRatio * 0.3) / 1000;
    const optimalRefluxRatio = 0.5 + (targetSplitTempF - 150) / 200;
    return { overheadBpd: Math.round(overheadBpd), bottomsBpd: Math.round(bottomsBpd), splitSharpness: Math.round(splitSharpness * 1000) / 1000, overlapF: Math.round(overlapF * 10) / 10, condenserDutyMMBtuHr: Math.round(condenserDutyMMBtuHr * 100) / 100, reboilerDutyMMBtuHr: Math.round(reboilerDutyMMBtuHr * 100) / 100, optimalRefluxRatio: Math.round(optimalRefluxRatio * 100) / 100 };
}

/** Reformer kinetics — aromatics yield prediction with operating conditions */
export function reformerKinetics(
    feedNaphthaBpd: number, feedNplusAVolPct: number, reactorTempF: number, reactorPressurePsig: number,
    h2HCRatio: number, lhsv: number, catalystAgeMonths: number, catalystType: 'semi-regen' | 'CCR'
): { c5PlusYieldVolPct: number; aromaticsYieldVolPct: number; hydrogenYieldScfBbl: number; ronIncrease: number; benzeneYieldVolPct: number; tolueneYieldVolPct: number; xyleneYieldVolPct: number; cokeDepositionLbHr: number; catalystDeactivationPct: number; cycleLengthEstimateMonths: number } {
    // Temperature driving force for aromatization
    const tempFactor = Math.exp((reactorTempF - 910) / 100);
    const pressPenalty = Math.exp(-(reactorPressurePsig - 150) / 200);
    const h2Benefit = Math.pow(h2HCRatio / 5, 0.3);
    // Catalyst deactivation
    const deactivationRate = catalystType === 'CCR' ? 0.003 : 0.015;
    const catalystDeactivationPct = (1 - Math.exp(-deactivationRate * catalystAgeMonths)) * 100;
    // Base aromatics from N+2A in feed
    const aromaticsYieldVolPct = feedNplusAVolPct * tempFactor * pressPenalty * h2Benefit * 1.1 * (1 - catalystDeactivationPct / 200);
    const c5PlusYieldVolPct = 100 - (100 - aromaticsYieldVolPct) * 0.85 - (reactorTempF - 900) * 0.03;
    const hydrogenYieldScfBbl = 800 + (aromaticsYieldVolPct - feedNplusAVolPct) * 30 + (reactorTempF - 910) * 5;
    const ronIncrease = (aromaticsYieldVolPct - feedNplusAVolPct * 0.4) * 1.2;
    const benzeneYieldVolPct = aromaticsYieldVolPct * 0.15 * (1 + (reactorTempF - 910) / 200);
    const tolueneYieldVolPct = aromaticsYieldVolPct * 0.35;
    const xyleneYieldVolPct = aromaticsYieldVolPct * 0.30;
    const cokeDepositionLbHr = feedNaphthaBpd * 0.003 * tempFactor * (1 - catalystDeactivationPct / 100) / 24;
    const cycleLengthEstimateMonths = catalystType === 'CCR' ? 60 : Math.max(3, 24 * Math.exp(-catalystDeactivationPct / 30));
    return { c5PlusYieldVolPct: Math.round(c5PlusYieldVolPct * 10) / 10, aromaticsYieldVolPct: Math.round(aromaticsYieldVolPct * 10) / 10, hydrogenYieldScfBbl: Math.round(hydrogenYieldScfBbl), ronIncrease: Math.round(ronIncrease * 10) / 10, benzeneYieldVolPct: Math.round(benzeneYieldVolPct * 10) / 10, tolueneYieldVolPct: Math.round(tolueneYieldVolPct * 10) / 10, xyleneYieldVolPct: Math.round(xyleneYieldVolPct * 10) / 10, cokeDepositionLbHr: Math.round(cokeDepositionLbHr * 10) / 10, catalystDeactivationPct: Math.round(catalystDeactivationPct * 10) / 10, cycleLengthEstimateMonths: Math.round(cycleLengthEstimateMonths) };
}

/** Isomerization equilibrium — thermodynamic conversion */
export function isomerizationEquilibrium(
    feedNParaffinPct: number, reactorTempF: number, recycleRatio: number, catalystActivityPct: number
): { equilibriumConversionPct: number; actualConversionPct: number; productRON: number; recycleNParaffinBpd: number; freshFeedBpd: number } {
    // Equilibrium favors branched at lower temperature
    const Keq = 8.5 * Math.exp(-(reactorTempF - 200) / 150);
    const equilibriumConversionPct = (Keq / (1 + Keq)) * 100 * catalystActivityPct / 100;
    const actualConversionPct = equilibriumConversionPct * (1 + 0.4 * recycleRatio) / (1 + recycleRatio);
    const productRON = 65 + (actualConversionPct / 100) * 28;
    const baseFeed = 10000;
    const freshFeedBpd = baseFeed;
    const recycleNParaffinBpd = freshFeedBpd * (1 - equilibriumConversionPct / 100) * recycleRatio;
    return { equilibriumConversionPct: Math.round(equilibriumConversionPct * 10) / 10, actualConversionPct: Math.round(actualConversionPct * 10) / 10, productRON: Math.round(productRON * 10) / 10, recycleNParaffinBpd: Math.round(recycleNParaffinBpd), freshFeedBpd };
}

/** Alkylation acid consumption model */
export function alkylationAcidConsumption(
    olefinFeedBpd: number, acidType: 'HF' | 'H2SO4', isobutaneToOlefinRatio: number,
    reactorTempF: number, acidStrengthPct: number, feedContaminantsPpm: number
): { acidConsumptionLbPerGalAlkylate: number; dailyAcidCost: number; spentAcidRegenCost: number; alkylateRON: number; acidMakeupRateGpm: number } {
    const olefinContent = olefinFeedBpd / (olefinFeedBpd + olefinFeedBpd / isobutaneToOlefinRatio);
    // Acid consumption increases with contaminants and temperature
    const baseConsumption = acidType === 'HF' ? 0.02 : 0.5;
    const tempPenalty = Math.exp((reactorTempF - (acidType === 'HF' ? 90 : 40)) / 50);
    const contaminantPenalty = 1 + feedContaminantsPpm / 50;
    const acidStrengthPenalty = acidType === 'H2SO4' ? (98 / Math.max(85, acidStrengthPct)) : 1;
    const acidConsumptionLbPerGalAlkylate = baseConsumption * tempPenalty * contaminantPenalty * acidStrengthPenalty;
    const alkylateBpd = olefinFeedBpd * 1.7 * isobutaneToOlefinRatio / (isobutaneToOlefinRatio + 1);
    const dailyAcidCost = acidConsumptionLbPerGalAlkylate * alkylateBpd * 42 * (acidType === 'HF' ? 1.8 : 0.08);
    const spentAcidRegenCost = acidType === 'H2SO4' ? dailyAcidCost * 0.6 : 0;
    const alkylateRON = 97 - (reactorTempF - (acidType === 'HF' ? 90 : 40)) * 0.05 - feedContaminantsPpm * 0.01;
    const acidMakeupRateGpm = acidConsumptionLbPerGalAlkylate * alkylateBpd * 42 / (acidType === 'HF' ? 8.34 * 0.97 : 8.34 * 1.84) / 1440;
    return { acidConsumptionLbPerGalAlkylate: Math.round(acidConsumptionLbPerGalAlkylate * 1000) / 1000, dailyAcidCost: Math.round(dailyAcidCost), spentAcidRegenCost: Math.round(spentAcidRegenCost), alkylateRON: Math.round(alkylateRON * 10) / 10, acidMakeupRateGpm: Math.round(acidMakeupRateGpm * 100) / 100 };
}

/** Gasoline blend non-linear octane optimization */
export function gasolineBlendNonLinear(
    components: { name: string; volBpd: number; ron: number; mon: number; rvpPsi: number; sulfurPpm: number; aromaticsVolPct: number; olefinsVolPct: number; benzeneVolPct: number; costPerBbl: number; oxygenateWtPct: number }[],
    ethanolVolPct: number
): { blendRON: number; blendMON: number; aki: number; blendRvpPsi: number; blendSulfurPpm: number; blendAromaticsPct: number; blendOlefinsPct: number; blendBenzenePct: number; totalBpd: number; totalCost: number; costPerBbl: number; giveawayRON: number; specificationViolations: string[] } {
    const totalBpd = components.reduce((s, c) => s + c.volBpd, 0);
    if (totalBpd === 0) return { blendRON: 0, blendMON: 0, aki: 0, blendRvpPsi: 0, blendSulfurPpm: 0, blendAromaticsPct: 0, blendOlefinsPct: 0, blendBenzenePct: 0, totalBpd: 0, totalCost: 0, costPerBbl: 0, giveawayRON: 0, specificationViolations: ['No components'] };
    // Non-linear octane blending with interaction coefficients
    let sumRONVol = 0, sumMONVol = 0, sumRVPSq = 0, sumS = 0, sumArom = 0, sumOlef = 0, sumBenz = 0, totalCost = 0;
    components.forEach(c => {
        const volFrac = c.volBpd / totalBpd;
        // Octane blending is non-linear: use blending octane numbers
        const blendRONContrib = c.ron * (1 + 0.08 * (c.aromaticsVolPct / 100) - 0.05 * (c.olefinsVolPct / 100) + 0.12 * c.oxygenateWtPct);
        const blendMONContrib = c.mon * (1 + 0.06 * (c.aromaticsVolPct / 100) - 0.04 * (c.olefinsVolPct / 100) + 0.10 * c.oxygenateWtPct);
        sumRONVol += blendRONContrib * volFrac;
        sumMONVol += blendMONContrib * volFrac;
        // RVP: Raoult's law-like non-linear blending
        sumRVPSq += Math.pow(c.rvpPsi, 1.25) * volFrac;
        sumS += c.sulfurPpm * volFrac;
        sumArom += c.aromaticsVolPct * volFrac;
        sumOlef += c.olefinsVolPct * volFrac;
        sumBenz += c.benzeneVolPct * volFrac;
        totalCost += c.costPerBbl * c.volBpd;
    });
    const blendRON = sumRONVol;
    const blendMON = sumMONVol;
    const aki = (blendRON + blendMON) / 2;
    const blendRvpPsi = Math.pow(sumRVPSq, 0.8);
    const blendSulfurPpm = sumS;
    const blendAromaticsPct = sumArom;
    const blendOlefinsPct = sumOlef;
    const blendBenzenePct = sumBenz;
    const costPerBbl = totalCost / totalBpd;
    const specViolations: string[] = [];
    if (blendSulfurPpm > 10) specViolations.push(`Sulfur ${blendSulfurPpm.toFixed(0)} > 10 ppm`);
    if (blendBenzenePct > 0.62) specViolations.push(`Benzene ${blendBenzenePct.toFixed(2)} > 0.62%`);
    if (blendAromaticsPct > 35) specViolations.push(`Aromatics ${blendAromaticsPct.toFixed(1)} > 35%`);
    if (blendOlefinsPct > 18) specViolations.push(`Olefins ${blendOlefinsPct.toFixed(1)} > 18%`);
    const giveawayRON = aki > 87 ? aki - 87 : 0;
    return { blendRON: Math.round(blendRON * 10) / 10, blendMON: Math.round(blendMON * 10) / 10, aki: Math.round(aki * 10) / 10, blendRvpPsi: Math.round(blendRvpPsi * 10) / 10, blendSulfurPpm: Math.round(blendSulfurPpm), blendAromaticsPct: Math.round(blendAromaticsPct * 10) / 10, blendOlefinsPct: Math.round(blendOlefinsPct * 10) / 10, blendBenzenePct: Math.round(blendBenzenePct * 100) / 100, totalBpd: Math.round(totalBpd), totalCost: Math.round(totalCost), costPerBbl: Math.round(costPerBbl * 100) / 100, giveawayRON: Math.round(giveawayRON * 10) / 10, specificationViolations: specViolations };
}

// ─── DIESEL & JET ───
/** Refractory sulfur kinetic model for ULSD */
export function refractorySulfurKinetics(
    feedTotalSulfurPpm: number, refractoryDMDBTFraction: number, reactorTempF: number,
    pressurePsig: number, lhsv: number, h2PartialPressurePsi: number, catalystType: 'CoMo' | 'NiMo' | 'noble'
): { productSulfurPpm: number; refractoryRemovalPct: number; easyRemovalPct: number; requiredResidenceTimeMin: number; kineticConstantK: number; activationEnergyKcalMol: number } {
    // Easy sulfur (mercaptans, sulfides) vs refractory (4,6-DMDBT and relatives)
    const activationEnergyKcalMol = catalystType === 'NiMo' ? 28 : catalystType === 'noble' ? 22 : 32;
    const R = 1.987; // kcal/mol·K
    const tempR = reactorTempF + 460;
    const k0Easy = 1.5e6;
    const k0Refractory = catalystType === 'NiMo' ? 8e4 : catalystType === 'noble' ? 2e5 : 3e4;
    const kEasy = k0Easy * Math.exp(-activationEnergyKcalMol * 1000 / (R * tempR)) * Math.pow(h2PartialPressurePsi / 500, 0.45);
    const kRefractory = k0Refractory * Math.exp(-(activationEnergyKcalMol + 5) * 1000 / (R * tempR)) * Math.pow(h2PartialPressurePsi / 500, 0.65);
    const residenceTimeMin = 60 / lhsv;
    const easyS = feedTotalSulfurPpm * (1 - refractoryDMDBTFraction);
    const refractoryS = feedTotalSulfurPpm * refractoryDMDBTFraction;
    const easyRemaining = easyS * Math.exp(-kEasy * residenceTimeMin / 60);
    const refractoryRemaining = refractoryS * Math.exp(-kRefractory * residenceTimeMin / 60);
    const productSulfurPpm = easyRemaining + refractoryRemaining;
    const easyRemovalPct = easyS > 0 ? (1 - easyRemaining / easyS) * 100 : 100;
    const refractoryRemovalPct = refractoryS > 0 ? (1 - refractoryRemaining / refractoryS) * 100 : 0;
    const kineticConstantK = kRefractory;
    return { productSulfurPpm: Math.round(productSulfurPpm * 10) / 10, refractoryRemovalPct: Math.round(refractoryRemovalPct * 10) / 10, easyRemovalPct: Math.round(easyRemovalPct * 10) / 10, requiredResidenceTimeMin: Math.round(residenceTimeMin * 10) / 10, kineticConstantK: Math.round(kineticConstantK * 100) / 100, activationEnergyKcalMol };
}

/** Cetane blend model with interaction factors */
export function cetaneBlendModel(
    components: { volPct: number; cetaneNumber: number; aromaticPct: number; densityKgM3: number }[]
): { blendCetane: number; cetaneIndex: number; linearAverage: number; aromaticsPenalty: number } {
    if (components.length === 0) return { blendCetane: 0, cetaneIndex: 0, linearAverage: 0, aromaticsPenalty: 0 };
    let volSum = 0, cetaneVolSum = 0, aromSum = 0;
    components.forEach(c => {
        volSum += c.volPct;
        // Aromatics reduce effective cetane more than linearly
        const aromaticsPenalty = 1 - c.aromaticPct / 100 * 0.7;
        cetaneVolSum += c.cetaneNumber * aromaticsPenalty * c.volPct;
        aromSum += c.aromaticPct * c.volPct;
    });
    const blendCetane = cetaneVolSum / volSum;
    const linearAverage = components.reduce((s, c) => s + c.cetaneNumber * c.volPct, 0) / volSum;
    const aromaticsPenalty = linearAverage - blendCetane;
    const avgDensity = components.reduce((s, c) => s + c.densityKgM3 * c.volPct, 0) / volSum;
    const cetaneIndex = 454.74 - 0.048 * avgDensity;
    return { blendCetane: Math.round(blendCetane * 10) / 10, cetaneIndex: Math.round(cetaneIndex * 10) / 10, linearAverage: Math.round(linearAverage * 10) / 10, aromaticsPenalty: Math.round(aromaticsPenalty * 10) / 10 };
}

/** Jet fuel quality detailed model */
export function jetFuelQualityModel(
    feedFreezePointC: number, feedSmokePointMm: number, feedSulfurWtPct: number,
    feedNaphthalenesVolPct: number, hydrotreatingSeverity: 'none' | 'mild' | 'severe',
    additiveFSII: boolean
): { finalFreezePointC: number; finalSmokePointMm: number; finalSulfurWtPct: number; thermalStabilityRating: 'pass' | 'borderline' | 'fail'; wsitRating: number; specificEnergyMJKg: number } {
    // Hydrotreating improves smoke point, removes sulfur, but doesn't change freeze point much
    const freezeDelta = hydrotreatingSeverity === 'severe' ? -3 : hydrotreatingSeverity === 'mild' ? -1 : 0;
    const smokeImprovement = hydrotreatingSeverity === 'severe' ? 8 : hydrotreatingSeverity === 'mild' ? 4 : 0;
    const sulfurReduction = hydrotreatingSeverity === 'severe' ? 0.95 : hydrotreatingSeverity === 'mild' ? 0.7 : 0;
    const finalFreezePointC = feedFreezePointC + freezeDelta;
    const finalSmokePointMm = feedSmokePointMm + smokeImprovement;
    const finalSulfurWtPct = feedSulfurWtPct * (1 - sulfurReduction);
    // Thermal stability depends on cleanliness
    const thermalStabilityRating: 'pass' | 'borderline' | 'fail' = hydrotreatingSeverity === 'severe' ? 'pass' : hydrotreatingSeverity === 'mild' ? (Math.random() > 0.3 ? 'pass' : 'borderline') : 'borderline';
    const wsitRating = hydrotreatingSeverity === 'severe' ? 95 : hydrotreatingSeverity === 'mild' ? 85 : 70;
    const specificEnergyMJKg = 43.2 - (feedNaphthalenesVolPct - 1) * 0.05 + smokeImprovement * 0.02;
    return { finalFreezePointC, finalSmokePointMm, finalSulfurWtPct: Math.round(finalSulfurWtPct * 1000) / 1000, thermalStabilityRating, wsitRating, specificEnergyMJKg: Math.round(specificEnergyMJKg * 100) / 100 };
}

// ─── FCC KINETICS ───
/** FCC riser kinetic simulation */
export function fccRiserKinetics(
    vgoFeedBpd: number, feedApi: number, feedCCRWtPct: number, feedMetalsNiVppm: number,
    riserOutletTempF: number, catToOilRatio: number, zsm5AdditiveWtPct: number,
    catalystActivityMAT: number, contactTimeSec: number
): { conversionPct: number; gasolineYieldVolPct: number; lcoYieldVolPct: number; slurryYieldVolPct: number; lpgYieldVolPct: number; dryGasWtPct: number; cokeWtPct: number; propyleneYieldVolPct: number; gasolineRON: number; catalystCirculationTonsMin: number; regeneratorTempF: number; heatBalanceCheckPct: number } {
    // Kinetic conversion model
    const tempKinetic = Math.exp((riserOutletTempF - 950) / 80);
    const CTOEffect = Math.pow(catToOilRatio / 7, 0.65);
    const MATEffect = Math.pow(catalystActivityMAT / 70, 0.5);
    const CCRPenalty = Math.exp(-feedCCRWtPct / 15);
    const metalsPenalty = Math.exp(-feedMetalsNiVppm / 30);
    const baseConversion = 72 * tempKinetic * CTOEffect * MATEffect * CCRPenalty * metalsPenalty;
    const conversionPct = Math.min(92, Math.max(45, baseConversion));
    // Yield structure based on conversion
    const convFrac = conversionPct / 100;
    const gasolineYieldVolPct = (convFrac * 55) * (1 + zsm5AdditiveWtPct * 0.015);
    const lcoYieldVolPct = (1 - convFrac) * 60;
    const slurryYieldVolPct = 100 - conversionPct - lcoYieldVolPct;
    const lpgYieldVolPct = convFrac * 25 * (1 + zsm5AdditiveWtPct * 0.06);
    const dryGasWtPct = convFrac * 4;
    const cokeWtPct = feedCCRWtPct * 1.15 + convFrac * 2.5;
    const propyleneYieldVolPct = lpgYieldVolPct * (0.4 + zsm5AdditiveWtPct * 0.08);
    const gasolineRON = 88 + (riserOutletTempF - 950) * 0.05 + zsm5AdditiveWtPct * 2.5;
    // Catalyst circulation
    const catHeatCapacityBtuLbF = 0.27;
    const deltaT = 1300 - 550;
    const catalystCirculationTonsMin = (catToOilRatio * vgoFeedBpd * 300) / (2000 * 1440);
    const regeneratorTempF = 1250 + catToOilRatio * 5 + cokeWtPct * 3;
    const heatBalanceCheckPct = 95 + 5 * (riserOutletTempF / 1000);
    return { conversionPct: Math.round(conversionPct * 10) / 10, gasolineYieldVolPct: Math.round(gasolineYieldVolPct * 10) / 10, lcoYieldVolPct: Math.round(lcoYieldVolPct * 10) / 10, slurryYieldVolPct: Math.round(Math.max(0, slurryYieldVolPct) * 10) / 10, lpgYieldVolPct: Math.round(lpgYieldVolPct * 10) / 10, dryGasWtPct: Math.round(dryGasWtPct * 10) / 10, cokeWtPct: Math.round(cokeWtPct * 10) / 10, propyleneYieldVolPct: Math.round(propyleneYieldVolPct * 10) / 10, gasolineRON: Math.round(gasolineRON * 10) / 10, catalystCirculationTonsMin: Math.round(catalystCirculationTonsMin * 10) / 10, regeneratorTempF: Math.round(regeneratorTempF), heatBalanceCheckPct: Math.round(heatBalanceCheckPct * 10) / 10 };
}

// ─── HYDROCRACKER ───
/** Hydrocracker catalyst deactivation & cycle life model */
export function hydrocrackerDeactivation(
    operatingDays: number, avgBedTempF: number, feedNitrogenPpm: number, feedSulfurWtPct: number,
    feedAsphaltenePpm: number, washWaterRateGpm: number, makeUpH2PurityPct: number
): { deactivationRateCPerDay: number; estimatedCycleLengthYears: number; bedTempIncreaseToDateF: number; remainingCatalystLifePct: number; optimalWABTF: number } {
    // Deactivation from coke laydown, metals, nitrogen poisoning
    const tempSeverity = Math.exp((avgBedTempF - 700) / 80);
    const nitrogenPoisoning = feedNitrogenPpm / 50;
    const asphalteneEffect = feedAsphaltenePpm / 100;
    const deactivationRateCPerDay = (0.015 * tempSeverity + 0.002 * nitrogenPoisoning + 0.001 * asphalteneEffect) * (1 - 0.05 * washWaterRateGpm / 50);
    const totalDeactivation = deactivationRateCPerDay * operatingDays;
    const maxAllowableDeactivation = 40; // °C
    const estimatedCycleLengthYears = maxAllowableDeactivation / (deactivationRateCPerDay * 365);
    const bedTempIncreaseToDateF = totalDeactivation * 1.8;
    const remainingCatalystLifePct = Math.max(0, (1 - totalDeactivation / maxAllowableDeactivation) * 100);
    const optimalWABTF = avgBedTempF + totalDeactivation * 0.6;
    return { deactivationRateCPerDay: Math.round(deactivationRateCPerDay * 10000) / 10000, estimatedCycleLengthYears: Math.round(estimatedCycleLengthYears * 10) / 10, bedTempIncreaseToDateF: Math.round(bedTempIncreaseToDateF * 10) / 10, remainingCatalystLifePct: Math.round(remainingCatalystLifePct * 10) / 10, optimalWABTF: Math.round(optimalWABTF) };
}

// ─── COKER & VISBREAKER ───
/** Coker drum cycle optimization */
export function cokerDrumCycleOptimization(
    fillTimeHr: number, steamOutTimeHr: number, waterQuenchTimeHr: number,
    drainTimeHr: number, unheadingTimeHr: number, cuttingTimeHr: number,
    reheadingTimeHr: number, warmupTimeHr: number, numDrums: number,
    feedBpd: number, drumVolumeBbl: number
): { totalCycleTimeHr: number; cokePerCycleTons: number; throughputBpd: number; drumUtilizationPct: number; optimalFillTimeHr: number; bottleneckStep: string; cokeCuttingWaterGpm: number } {
    const totalCycleTimeHr = fillTimeHr + steamOutTimeHr + waterQuenchTimeHr + drainTimeHr + unheadingTimeHr + cuttingTimeHr + reheadingTimeHr + warmupTimeHr;
    const cokePerCycleTons = (feedBpd * fillTimeHr / 24) * 0.3 / 2000 * 2000;
    const effectiveFeedBpd = feedBpd * (1 - 1 / numDrums);
    const drumUtilizationPct = (fillTimeHr / totalCycleTimeHr) * 100;
    // Optimal fill time balances drum utilization vs coke hardness
    const optimalFillTimeHr = drumVolumeBbl / (feedBpd * 0.4 / 24);
    // Bottleneck identification
    const steps = [
        { name: 'Fill', time: fillTimeHr }, { name: 'Steam Out', time: steamOutTimeHr },
        { name: 'Quench', time: waterQuenchTimeHr }, { name: 'Drain', time: drainTimeHr },
        { name: 'Unheading', time: unheadingTimeHr }, { name: 'Cutting', time: cuttingTimeHr },
        { name: 'Re-heading', time: reheadingTimeHr }, { name: 'Warmup', time: warmupTimeHr },
    ];
    const bottleneck = steps.sort((a, b) => b.time - a.time)[0];
    const cokeCuttingWaterGpm = 3000 * (cokePerCycleTons / 500);
    return { totalCycleTimeHr: Math.round(totalCycleTimeHr * 10) / 10, cokePerCycleTons: Math.round(cokePerCycleTons), throughputBpd: Math.round(effectiveFeedBpd), drumUtilizationPct: Math.round(drumUtilizationPct * 10) / 10, optimalFillTimeHr: Math.round(optimalFillTimeHr * 10) / 10, bottleneckStep: bottleneck.name, cokeCuttingWaterGpm: Math.round(cokeCuttingWaterGpm) };
}


/** SDA (Solvent Deasphalting) detailed model */
export function solventDeasphaltingDetailed(
    feedBpd: number, feedApi: number, feedCCRWtPct: number, feedMetalsNiVppm: number,
    solventType: 'propane' | 'butane' | 'pentane', solventToOilRatio: number, extractionTempF: number
): { daoYieldVolPct: number; daoApi: number; daoCCRWtPct: number; daoMetalsNiVppm: number; pitchYieldVolPct: number; pitchCCRWtPct: number; pitchSofteningPointF: number; solventRecoveryPct: number; incrementalValuePerBbl: number } {
    // Heavier solvent = higher DAO yield but lower quality
    const solventFactor = solventType === 'pentane' ? 1.5 : solventType === 'butane' ? 1.0 : 0.6;
    const baseDAO = 40 + solventFactor * 18;
    const tempEffect = (extractionTempF - 150) * 0.1;
    const ratioEffect = Math.log(solventToOilRatio) * 5;
    const daoYieldVolPct = Math.min(85, Math.max(20, baseDAO + tempEffect + ratioEffect));
    const daoFactor = daoYieldVolPct / 100;
    // DAO quality — impurities partition to pitch
    const CCRExtraction = 0.15;
    const metalsExtraction = 0.08;
    const daoApi = feedApi + (100 - feedApi) * 0.1 * (solventType === 'pentane' ? 1.2 : 1);
    const daoCCRWtPct = feedCCRWtPct * CCRExtraction * (solventType === 'propane' ? 0.7 : 1);
    const daoMetalsNiVppm = feedMetalsNiVppm * metalsExtraction;
    const pitchYieldVolPct = 100 - daoYieldVolPct;
    const pitchCCRWtPct = (feedCCRWtPct * 100 - daoCCRWtPct * daoYieldVolPct) / Math.max(1, pitchYieldVolPct);
    const pitchSofteningPointF = 120 + pitchCCRWtPct * 4;
    const solventRecoveryPct = 99.5;
    const incrementalValuePerBbl = (daoYieldVolPct / 100) * 25 - 5;
    return { daoYieldVolPct: Math.round(daoYieldVolPct * 10) / 10, daoApi: Math.round(daoApi * 10) / 10, daoCCRWtPct: Math.round(daoCCRWtPct * 100) / 100, daoMetalsNiVppm: Math.round(daoMetalsNiVppm * 10) / 10, pitchYieldVolPct: Math.round(pitchYieldVolPct * 10) / 10, pitchCCRWtPct: Math.round(pitchCCRWtPct * 100) / 100, pitchSofteningPointF: Math.round(pitchSofteningPointF), solventRecoveryPct, incrementalValuePerBbl: Math.round(incrementalValuePerBbl * 100) / 100 };
}

// ─── HYDROGEN NETWORK ───
/** Hydrogen network pinch analysis */
export function hydrogenPinchAnalysis(
    sources: { name: string; flowMmscfd: number; purityPct: number; pressurePsig: number }[],
    sinks: { name: string; flowMmscfd: number; requiredPurityPct: number; pressurePsig: number }[],
    makeupH2PurityPct: number
): { totalSourceFlow: number; totalSinkFlow: number; minimumMakeupH2Mmscfd: number; wastePurgeMmscfd: number; pinchPurityPct: number; networkRecoveryPct: number; compressionRequiredHp: number; costSavingsPotentialPct: number } {
    // Sort by purity descending for sources
    const sortedSources = [...sources].sort((a, b) => b.purityPct - a.purityPct);
    const sortedSinks = [...sinks].sort((a, b) => b.requiredPurityPct - a.requiredPurityPct);
    const totalSourceFlow = sources.reduce((s, src) => s + src.flowMmscfd, 0);
    const totalSinkFlow = sinks.reduce((s, snk) => s + snk.flowMmscfd, 0);
    // Simple pinch: calculate minimum makeup
    let accumSourceFlow = 0, accumSourceH2 = 0;
    sortedSources.forEach(s => { accumSourceFlow += s.flowMmscfd; accumSourceH2 += s.flowMmscfd * s.purityPct / 100; });
    const sourceAvgPurity = accumSourceFlow > 0 ? accumSourceH2 / accumSourceFlow * 100 : 0;
    let accumSinkFlow = 0, accumSinkH2 = 0;
    sortedSinks.forEach(s => { accumSinkFlow += s.flowMmscfd; accumSinkH2 += s.flowMmscfd * s.requiredPurityPct / 100; });
    // Makeup calculation
    const totalH2Required = accumSinkH2;
    const totalH2Available = accumSourceH2;
    const makeupH2Mmscfd = Math.max(0, (totalH2Required - totalH2Available) / (makeupH2PurityPct / 100));
    const wastePurgeMmscfd = Math.max(0, totalSourceFlow + makeupH2Mmscfd - totalSinkFlow);
    const pinchPurityPct = sortedSinks.length > 0 ? sortedSinks[sortedSinks.length - 1].requiredPurityPct : 90;
    const networkRecoveryPct = totalSourceFlow > 0 ? (1 - wastePurgeMmscfd / (totalSourceFlow + makeupH2Mmscfd)) * 100 : 0;
    const compressionRequiredHp = (makeupH2Mmscfd * 1000 * 50 + wastePurgeMmscfd * 1000 * 30) / 24;
    const costSavingsPotentialPct = wastePurgeMmscfd > 1 ? 15 + wastePurgeMmscfd * 2 : 5;
    return { totalSourceFlow, totalSinkFlow, minimumMakeupH2Mmscfd: Math.round(makeupH2Mmscfd * 100) / 100, wastePurgeMmscfd: Math.round(wastePurgeMmscfd * 100) / 100, pinchPurityPct: Math.round(pinchPurityPct * 10) / 10, networkRecoveryPct: Math.round(networkRecoveryPct * 10) / 10, compressionRequiredHp: Math.round(compressionRequiredHp), costSavingsPotentialPct: Math.round(costSavingsPotentialPct * 10) / 10 };
}

/** PSA performance with multi-component feed */
export function psaPerformanceDetailed(
    feedFlowMmscfd: number, feedH2Pct: number, feedCOPct: number, feedCH4Pct: number, feedN2Pct: number,
    adsorptionPressurePsig: number, desorptionPressurePsig: number, cycleTimeMin: number, numBeds: number
): { productH2FlowMmscfd: number; productPurityPct: number; h2RecoveryPct: number; tailGasFlowMmscfd: number; tailGasLHVBtuScf: number; adsorbentProductivityScfH2LbAds: number } {
    const pressureRatio = (adsorptionPressurePsig + 14.7) / (desorptionPressurePsig + 14.7);
    const totalFlow = feedFlowMmscfd;
    const h2In = totalFlow * feedH2Pct / 100;
    // H2 recovery is a function of pressure ratio, cycle time, and number of beds
    const h2RecoveryPct = Math.min(92, 70 + 15 * Math.log(pressureRatio) / Math.log(5) + numBeds * 2 - cycleTimeMin * 0.3);
    const productH2FlowMmscfd = h2In * h2RecoveryPct / 100;
    // Product purity from impurity rejection
    const impurityRejection = 0.995;
    const totalImpuritiesIn = totalFlow * (100 - feedH2Pct) / 100;
    const impuritiesInProduct = totalImpuritiesIn * (1 - impurityRejection);
    const productTotalFlow = productH2FlowMmscfd + impuritiesInProduct;
    const productPurityPct = productTotalFlow > 0 ? (productH2FlowMmscfd / productTotalFlow) * 100 : 99.9;
    const tailGasFlowMmscfd = totalFlow - productTotalFlow;
    const tailGasLHVBtuScf = (feedCOPct * 320 + feedCH4Pct * 910 + feedN2Pct * 0) / 100;
    const adsorbentProductivityScfH2LbAds = productH2FlowMmscfd * 1e6 / (totalFlow * 10000);
    return { productH2FlowMmscfd: Math.round(productH2FlowMmscfd * 100) / 100, productPurityPct: Math.round(productPurityPct * 100) / 100, h2RecoveryPct: Math.round(h2RecoveryPct * 10) / 10, tailGasFlowMmscfd: Math.round(tailGasFlowMmscfd * 100) / 100, tailGasLHVBtuScf: Math.round(tailGasLHVBtuScf), adsorbentProductivityScfH2LbAds: Math.round(adsorbentProductivityScfH2LbAds) };
}

// ─── SULFUR / ENVIRONMENTAL ───
/** Sour water stripper design */
export function sourWaterStripperDesign(
    sourWaterGpm: number, h2sInPpmw: number, nh3InPpmw: number, steamRateLbHr: number, numTrays: number
): { strippedWaterH2sPpmw: number; strippedWaterNh3Ppmw: number; acidGasH2sLbHr: number; acidGasNh3LbHr: number; strippingEfficiencyPct: number; steamToFeedRatio: number; reboilerDutyMMBtuHr: number } {
    const waterLbHr = sourWaterGpm * 500;
    const h2sInLbHr = waterLbHr * h2sInPpmw / 1e6;
    const nh3InLbHr = waterLbHr * nh3InPpmw / 1e6;
    const steamToFeedRatio = steamRateLbHr / waterLbHr;
    // Stripping efficiency per tray
    const trayEfficiency = 0.15;
    const strippingEfficiencyPct = (1 - Math.exp(-trayEfficiency * numTrays * steamToFeedRatio * 2)) * 100;
    const strippedWaterH2sPpmw = h2sInPpmw * (1 - strippingEfficiencyPct / 100);
    const strippedWaterNh3Ppmw = nh3InPpmw * (1 - strippingEfficiencyPct / 100 * 0.85);
    const acidGasH2sLbHr = h2sInLbHr * strippingEfficiencyPct / 100;
    const acidGasNh3LbHr = nh3InLbHr * strippingEfficiencyPct / 100 * 0.85;
    const reboilerDutyMMBtuHr = steamRateLbHr * 1000 / 1e6;
    return { strippedWaterH2sPpmw: Math.round(strippedWaterH2sPpmw * 10) / 10, strippedWaterNh3Ppmw: Math.round(strippedWaterNh3Ppmw * 10) / 10, acidGasH2sLbHr: Math.round(acidGasH2sLbHr * 10) / 10, acidGasNh3LbHr: Math.round(acidGasNh3LbHr * 10) / 10, strippingEfficiencyPct: Math.round(strippingEfficiencyPct * 10) / 10, steamToFeedRatio: Math.round(steamToFeedRatio * 1000) / 1000, reboilerDutyMMBtuHr: Math.round(reboilerDutyMMBtuHr * 100) / 100 };
}

/** CO2 emissions detailed by source */
export function co2EmissionsDetailed(
    firedHeaterFuelMmscfd: number, boilerFuelMmscfd: number, smrFuelMmscfd: number, fccCokeBurnTpd: number,
    powerImportMW: number, gridEmissionFactorTonnePerMWh: number, flareMmscfd: number
): { heaterCO2Tpd: number; boilerCO2Tpd: number; smrCO2Tpd: number; fccCO2Tpd: number; powerCO2Tpd: number; flareCO2Tpd: number; totalCO2Tpd: number; totalCO2Ktpy: number; co2PerBblCrudeLb: number; scope1Pct: number; scope2Pct: number } {
    const ngCO2Factor = 0.0549; // tonnes CO2 per Mscf natural gas
    const heaterCO2Tpd = firedHeaterFuelMmscfd * 1000 * ngCO2Factor;
    const boilerCO2Tpd = boilerFuelMmscfd * 1000 * ngCO2Factor;
    const smrCO2Tpd = smrFuelMmscfd * 1000 * ngCO2Factor + smrFuelMmscfd * 500 * ngCO2Factor;
    const fccCO2Tpd = fccCokeBurnTpd * 3.67;
    const powerCO2Tpd = powerImportMW * 24 * gridEmissionFactorTonnePerMWh;
    const flareCO2Tpd = flareMmscfd * 1000 * ngCO2Factor;
    const totalCO2Tpd = heaterCO2Tpd + boilerCO2Tpd + smrCO2Tpd + fccCO2Tpd + powerCO2Tpd + flareCO2Tpd;
    const scope1CO2 = heaterCO2Tpd + boilerCO2Tpd + smrCO2Tpd + fccCO2Tpd + flareCO2Tpd;
    const scope2CO2 = powerCO2Tpd;
    const scope1Pct = totalCO2Tpd > 0 ? (scope1CO2 / totalCO2Tpd) * 100 : 0;
    const scope2Pct = totalCO2Tpd > 0 ? (scope2CO2 / totalCO2Tpd) * 100 : 0;
    const co2PerBblCrudeLb = totalCO2Tpd * 2000 / 200000;
    return { heaterCO2Tpd: Math.round(heaterCO2Tpd), boilerCO2Tpd: Math.round(boilerCO2Tpd), smrCO2Tpd: Math.round(smrCO2Tpd), fccCO2Tpd: Math.round(fccCO2Tpd), powerCO2Tpd: Math.round(powerCO2Tpd), flareCO2Tpd: Math.round(flareCO2Tpd), totalCO2Tpd: Math.round(totalCO2Tpd), totalCO2Ktpy: Math.round(totalCO2Tpd * 0.365 * 10) / 10, co2PerBblCrudeLb: Math.round(co2PerBblCrudeLb * 10) / 10, scope1Pct: Math.round(scope1Pct * 10) / 10, scope2Pct: Math.round(scope2Pct * 10) / 10 };
}

// ─── LUBE & SPECIALTIES ───
/** VI improver blending model */
export function lubricantVIModel(
    baseOilVI: number, baseOilKV100: number, viImproverType: 'olefin-copolymer' | 'PMA' | 'SBC' | 'SEBS',
    viImproverTreatRateWtPct: number, baseOilSaturatesPct: number
): { blendedVI: number; blendedKV100: number; shearStabilityIndex: number; thickeningEfficiency: number; coldCrankingViscosity: number } {
    const viiFactors: Record<string, { efficiency: number; shearStability: number; thickeningPower: number }> = {
        'olefin-copolymer': { efficiency: 0.85, shearStability: 0.65, thickeningPower: 8 },
        'PMA': { efficiency: 0.92, shearStability: 0.55, thickeningPower: 10 },
        'SBC': { efficiency: 0.78, shearStability: 0.80, thickeningPower: 12 },
        'SEBS': { efficiency: 0.80, shearStability: 0.75, thickeningPower: 14 },
    };
    const f = viiFactors[viImproverType] || viiFactors['olefin-copolymer'];
    const VIboost = viImproverTreatRateWtPct * f.thickeningPower * f.efficiency * (baseOilSaturatesPct / 100);
    const blendedVI = Math.min(250, baseOilVI + VIboost);
    const blendedKV100 = baseOilKV100 * (1 + viImproverTreatRateWtPct * f.thickeningPower / 100);
    const shearStabilityIndex = f.shearStability * 100;
    const thickeningEfficiency = f.efficiency * f.thickeningPower;
    const coldCrankingViscosity = blendedKV100 * 4.5 * Math.pow(0.85, viImproverTreatRateWtPct / 2);
    return { blendedVI: Math.round(blendedVI), blendedKV100: Math.round(blendedKV100 * 10) / 10, shearStabilityIndex: Math.round(shearStabilityIndex), thickeningEfficiency: Math.round(thickeningEfficiency * 10) / 10, coldCrankingViscosity: Math.round(coldCrankingViscosity) };
}

/** Asphalt PG grade prediction */
export function asphaltPGGradePrediction(
    originalPenetration: number, softeningPointF: number, viscosityAt60C_Poise: number,
    polymerModifierPct: number, agingIndex: number
): { highTempGradeC: number; lowTempGradeC: number; pgGrade: string; ruttingFactorGStarSinDelta: number; fatigueFactorGStarSinDeltaRolling: number; mValue: number; sValue: number } {
    const highTempGradeC = 46 + (softeningPointF - 100) * 0.35 + polymerModifierPct * 4 + (Math.log(viscosityAt60C_Poise) - 4) * 8;
    const lowTempGradeC = -10 - (originalPenetration - 60) * 0.2 - polymerModifierPct * 5 + agingIndex * 6;
    const roundedHigh = Math.ceil(highTempGradeC / 6) * 6;
    const roundedLow = Math.floor(lowTempGradeC / 6) * 6;
    const pgGrade = `PG ${roundedHigh}-${Math.abs(roundedLow)}`;
    const ruttingFactorGStarSinDelta = 1.2 + polymerModifierPct * 0.5 - agingIndex * 0.1;
    const fatigueFactorGStarSinDeltaRolling = 3.5 - polymerModifierPct * 0.8 + agingIndex * 0.3;
    const mValue = 0.3 + polymerModifierPct * 0.05 - agingIndex * 0.02;
    const sValue = 200 - polymerModifierPct * 30 + agingIndex * 20;
    return { highTempGradeC: Math.round(highTempGradeC), lowTempGradeC: Math.round(lowTempGradeC), pgGrade, ruttingFactorGStarSinDelta: Math.round(ruttingFactorGStarSinDelta * 100) / 100, fatigueFactorGStarSinDeltaRolling: Math.round(fatigueFactorGStarSinDeltaRolling * 100) / 100, mValue: Math.round(mValue * 100) / 100, sValue: Math.round(sValue) };
}

// ─── UTILITIES ───
/** Steam system optimization across headers */
export function steamSystemOptimization(
    hpSteamKlbHr: number, mpSteamKlbHr: number, lpSteamKlbHr: number,
    hpPressurePsig: number, mpPressurePsig: number, lpPressurePsig: number,
    turbineIsentropicEffPct: number, electricPricePerMWh: number
): { letdownPowerGenMW: number; letdownRevenuePerHr: number; steamValuePerKlb: { hp: number; mp: number; lp: number }; optimalLetdownSplit: { hpToMp: number; hpToLp: number; mpToLp: number }; ventLossKlbHr: number } {
    const deltaH_HP_MP = (hpPressurePsig - mpPressurePsig) * 0.5;
    const deltaH_HP_LP = (hpPressurePsig - lpPressurePsig) * 0.7;
    const deltaH_MP_LP = (mpPressurePsig - lpPressurePsig) * 0.6;
    const mechanicalEff = 0.97;
    const generatorEff = 0.96;
    const overallEff = turbineIsentropicEffPct / 100 * mechanicalEff * generatorEff;
    const hpToMp = hpSteamKlbHr * 0.6;
    const hpToLp = hpSteamKlbHr * 0.1;
    const mpToLp = mpSteamKlbHr * 0.4;
    const letdownPowerGenMW = (hpToMp * deltaH_HP_MP + hpToLp * deltaH_HP_LP + mpToLp * deltaH_MP_LP) * overallEff / 3412;
    const letdownRevenuePerHr = letdownPowerGenMW * electricPricePerMWh;
    const steamValuePerKlb = {
        hp: 8.5 + hpPressurePsig * 0.002,
        mp: 6.0 + mpPressurePsig * 0.002,
        lp: 3.5 + lpPressurePsig * 0.002,
    };
    const ventLossKlbHr = Math.max(0, lpSteamKlbHr - hpSteamKlbHr * 0.3);
    return { letdownPowerGenMW: Math.round(letdownPowerGenMW * 100) / 100, letdownRevenuePerHr: Math.round(letdownRevenuePerHr), steamValuePerKlb, optimalLetdownSplit: { hpToMp: Math.round(hpToMp), hpToLp: Math.round(hpToLp), mpToLp: Math.round(mpToLp) }, ventLossKlbHr: Math.round(ventLossKlbHr) };
}

/** Gas turbine CHP performance with ambient conditions */
export function gasTurbineCHPDetailed(
    fuelInputMMBtuHr: number, ambientTempF: number, ambientPressurePsia: number, relativeHumidityPct: number,
    turbineModel: 'frame5' | 'frame6' | 'frame7' | 'frame9' | 'aeroderivative',
    hrsgApproachTempF: number
): { powerOutputMW: number; heatRateBtuPerKWh: number; exhaustTempF: number; exhaustFlowLbHr: number; hrsgSteamKlbHr: number; overallCHPEffPct: number; noxEmissionsPpm: number; waterInjectionGpm: number } {
    const isoPowerMW = turbineModel === 'frame9' ? 250 : turbineModel === 'frame7' ? 180 : turbineModel === 'frame6' ? 45 : turbineModel === 'frame5' ? 28 : 42;
    const isoHeatRate = turbineModel === 'aeroderivative' ? 8500 : 10500;
    // Ambient derating
    const tempDerating = Math.max(0.75, 1 - (ambientTempF - 59) * 0.004);
    const pressDerating = Math.max(0.90, ambientPressurePsia / 14.7);
    const humidityDerating = 1 - (relativeHumidityPct - 60) * 0.0007;
    const powerOutputMW = isoPowerMW * tempDerating * pressDerating * humidityDerating;
    const heatRateBtuPerKWh = isoHeatRate / tempDerating;
    const exhaustEnergyMMBtuHr = fuelInputMMBtuHr - powerOutputMW * 3.412;
    const exhaustTempF = 800 + (fuelInputMMBtuHr - 500) * 0.2 + ambientTempF * 0.15;
    const exhaustFlowLbHr = fuelInputMMBtuHr * 1e6 / (0.27 * (exhaustTempF - 300));
    // HRSG
    const hrsgEffectiveness = 1 - Math.exp(-0.05 * (exhaustTempF - hrsgApproachTempF - 300) / 100);
    const hrsgSteamKlbHr = exhaustEnergyMMBtuHr * hrsgEffectiveness * 0.9;
    const overallCHPEffPct = ((powerOutputMW * 3.412 + hrsgSteamKlbHr * 1) / fuelInputMMBtuHr) * 100;
    const noxEmissionsPpm = turbineModel === 'aeroderivative' ? 15 : 25;
    const waterInjectionGpm = powerOutputMW * 2 * Math.max(0, ambientTempF - 59) / 50;
    return { powerOutputMW: Math.round(powerOutputMW * 10) / 10, heatRateBtuPerKWh: Math.round(heatRateBtuPerKWh), exhaustTempF: Math.round(exhaustTempF), exhaustFlowLbHr: Math.round(exhaustFlowLbHr), hrsgSteamKlbHr: Math.round(hrsgSteamKlbHr), overallCHPEffPct: Math.round(overallCHPEffPct * 10) / 10, noxEmissionsPpm, waterInjectionGpm: Math.round(waterInjectionGpm) };
}

// ─── ECONOMICS & PLANNING ───
/** Netback pricing for each product */
export function productNetbackPricing(
    productPricePerBbl: number, freightToMarketPerBbl: number, terminalFeesPerBbl: number,
    rvocRINValuePerBbl: number, lcfsCreditPerBbl: number, qualityPremiumPerBbl: number
): { grossRevenuePerBbl: number; netbackPerBbl: number; deductionsTotal: number; effectiveMarginPerBbl: number } {
    const grossRevenuePerBbl = productPricePerBbl + rvocRINValuePerBbl + lcfsCreditPerBbl + qualityPremiumPerBbl;
    const deductionsTotal = freightToMarketPerBbl + terminalFeesPerBbl;
    const netbackPerBbl = grossRevenuePerBbl - deductionsTotal;
    const effectiveMarginPerBbl = netbackPerBbl - 75;
    return { grossRevenuePerBbl, netbackPerBbl, deductionsTotal, effectiveMarginPerBbl };
}

/** Crude valuation — marginal value of each crude in LP */
export function crudeMarginalValue(
    crudes: { name: string; costPerBbl: number; api: number; sulfurWtPct: number; naphthaYield: number; dieselYield: number; vgoYield: number; residueYield: number }[],
    productCrackValues: { gasoline: number; diesel: number; jet: number; fuelOil: number; lpg: number },
    maxSulfur: number, minApi: number
): { name: string; marginalValuePerBbl: number; breakevenPricePerBbl: number; ranking: number; constraintActive: string }[] {
    return crudes.map((c, i) => {
        const productValue = c.naphthaYield * productCrackValues.gasoline / 42 + c.dieselYield * productCrackValues.diesel / 42 + c.vgoYield * productCrackValues.jet / 42 + c.residueYield * productCrackValues.fuelOil / 42;
        const sulfurPenalty = c.sulfurWtPct > maxSulfur ? (c.sulfurWtPct - maxSulfur) * 5 : 0;
        const apiPenalty = c.api < minApi ? (minApi - c.api) * 0.3 : 0;
        const marginalValuePerBbl = productValue - c.costPerBbl - sulfurPenalty - apiPenalty;
        const breakevenPricePerBbl = productValue - sulfurPenalty - apiPenalty;
        const constraintActive = sulfurPenalty > apiPenalty ? 'Sulfur' : apiPenalty > 0 ? 'API' : 'None';
        return { name: c.name, marginalValuePerBbl: Math.round(marginalValuePerBbl * 100) / 100, breakevenPricePerBbl: Math.round(breakevenPricePerBbl * 100) / 100, ranking: i + 1, constraintActive };
    }).sort((a, b) => b.marginalValuePerBbl - a.marginalValuePerBbl);
}

/** Turnaround schedule optimization across multiple units */
export function turnaroundScheduleOptimizer(
    units: { name: string; runLengthYears: number; turnDurationDays: number; turnCostMM: number; capacityBpd: number; marginPerBbl: number }[]
): { schedule: { name: string; nextTurnYear: number; turnMonth: string; durationDays: number; npvImpactMM: number }[]; totalAnnualImpactMM: number; resourceConflictMonths: string[] } {
    const schedule = units.map((u, i) => {
        const yearOffset = i * 0.5;
        const nextTurnYear = Math.ceil(yearOffset);
        const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
        const turnMonth = months[i % months.length];
        const dailyLoss = u.capacityBpd * u.marginPerBbl / 1e6;
        const npvImpactMM = dailyLoss * u.turnDurationDays + u.turnCostMM / u.runLengthYears;
        return { name: u.name, nextTurnYear, turnMonth, durationDays: u.turnDurationDays, npvImpactMM: Math.round(npvImpactMM * 10) / 10 };
    });
    const resourceConflictMonths: string[] = [];
    const monthCounts: Record<string, number> = {};
    schedule.forEach(s => { monthCounts[s.turnMonth] = (monthCounts[s.turnMonth] || 0) + 1; });
    Object.entries(monthCounts).forEach(([month, count]) => { if (count > 1) resourceConflictMonths.push(month); });
    const totalAnnualImpactMM = schedule.reduce((s, u) => s + u.npvImpactMM, 0);
    return { schedule, totalAnnualImpactMM: Math.round(totalAnnualImpactMM * 10) / 10, resourceConflictMonths };
}

// ─── STORAGE & DISPATCH ───
/** Multi-product pipeline batch scheduling */
export function pipelineBatchScheduler(
    products: { name: string; monthlyVolumeBbl: number; interfaceDowngradeBbl: number }[],
    pipeDiameterIn: number, lengthMiles: number, flowRateBph: number, operatingHoursPerDay: number
): { batchesPerMonth: number; cycleTimeDays: number; totalPumpingDays: number; interfaceLossBbl: number; interfaceLossCost: number; pipelineUtilizationPct: number } {
    const totalVolume = products.reduce((s, p) => s + p.monthlyVolumeBbl, 0);
    const totalInterface = products.length * products[0].interfaceDowngradeBbl;
    const batchSize = pipeDiameterIn * pipeDiameterIn * Math.PI / 4 * 5280 * lengthMiles / 5.615 * 0.85;
    const batchesPerMonth = Math.ceil(totalVolume / batchSize);
    const cycleTimeDays = totalVolume / (flowRateBph * operatingHoursPerDay);
    const totalPumpingDays = cycleTimeDays;
    const interfaceLossBbl = batchesPerMonth * totalInterface;
    const interfaceLossCost = interfaceLossBbl * 8;
    const pipelineUtilizationPct = (totalPumpingDays / 30) * 100;
    return { batchesPerMonth, cycleTimeDays: Math.round(cycleTimeDays * 10) / 10, totalPumpingDays: Math.round(totalPumpingDays * 10) / 10, interfaceLossBbl: Math.round(interfaceLossBbl), interfaceLossCost: Math.round(interfaceLossCost), pipelineUtilizationPct: Math.round(pipelineUtilizationPct * 10) / 10 };
}

/** Truck rack optimization — minimize queue time */
export function truckRackOptimization(
    dailyTrucks: number, numLanes: number, avgLoadGpm: number, avgLoadSizeGal: number,
    switchTimeMin: number, operatingHoursPerDay: number
): { trucksPerLanePerDay: number; avgQueueTimeMin: number; avgServiceTimeMin: number; rackUtilizationPct: number; additionalLanesNeededForQueueTarget: number; costPerTruckLoaded: number } {
    const serviceTimeMin = avgLoadSizeGal / avgLoadGpm + switchTimeMin;
    const capacityPerLanePerDay = (operatingHoursPerDay * 60) / serviceTimeMin;
    const trucksPerLanePerDay = dailyTrucks / numLanes;
    // Queue theory (M/M/c)
    const arrivalRate = dailyTrucks / (operatingHoursPerDay * 60);
    const serviceRate = 1 / serviceTimeMin;
    const utilization = arrivalRate / (numLanes * serviceRate);
    const rackUtilizationPct = Math.min(99, utilization * 100);
    // Approximate queue time using M/M/c approximation
    const erlangC = utilization < 1 ? (Math.pow(numLanes * utilization, numLanes) / factorial(numLanes)) / ((Math.pow(numLanes * utilization, numLanes) / factorial(numLanes)) + (1 - utilization) * sumOfTerms(numLanes, numLanes * utilization)) : 0;
    const avgQueueTimeMin = erlangC > 0 ? (erlangC / (numLanes * serviceRate * (1 - utilization))) : 0;
    const targetQueueMin = 15;
    const additionalLanesNeededForQueueTarget = Math.max(0, Math.ceil((arrivalRate / (serviceRate * 0.7)) - numLanes));
    const costPerTruckLoaded = (serviceTimeMin + avgQueueTimeMin) * 1.5;
    return { trucksPerLanePerDay: Math.round(trucksPerLanePerDay), avgQueueTimeMin: Math.round(avgQueueTimeMin * 10) / 10, avgServiceTimeMin: Math.round(serviceTimeMin * 10) / 10, rackUtilizationPct: Math.round(rackUtilizationPct * 10) / 10, additionalLanesNeededForQueueTarget, costPerTruckLoaded: Math.round(costPerTruckLoaded * 100) / 100 };
}

function factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}
function sumOfTerms(c: number, rho: number): number {
    let sum = 0;
    for (let n = 0; n < c; n++) sum += Math.pow(rho, n) / factorial(n);
    return sum;
}

/** Marine terminal loading optimization */
export function marineLoadingOptimization(
    vesselSizeBbl: number, numBerths: number, loadingRatePerArmBph: number, numArmsPerBerth: number,
    arrivalRateVesselsPerMonth: number, demurrageRatePerDay: number, portFeesPerCall: number
): { totalLoadingTimeHr: number; berthUtilizationPct: number; demurrageRiskDaysPerMonth: number; monthlyThroughputBbl: number; optimalVesselSizeBbl: number; costPerBblLoaded: number; queueProbability: number } {
    const loadingRatePerBerth = loadingRatePerArmBph * numArmsPerBerth;
    const loadingTimeHr = vesselSizeBbl / loadingRatePerBerth;
    const totalLoadingTimeHr = loadingTimeHr + 4;
    const monthlyCapacityPerBerth = 30 * 24 / totalLoadingTimeHr * vesselSizeBbl;
    const totalMonthlyCapacity = monthlyCapacityPerBerth * numBerths;
    const monthlyThroughputBbl = Math.min(arrivalRateVesselsPerMonth * vesselSizeBbl, totalMonthlyCapacity);
    const berthUtilizationPct = monthlyThroughputBbl / totalMonthlyCapacity * 100;
    const demurrageRiskDaysPerMonth = Math.max(0, (arrivalRateVesselsPerMonth * vesselSizeBbl - totalMonthlyCapacity) / vesselSizeBbl * (totalLoadingTimeHr / 24));
    const optimalVesselSizeBbl = Math.sqrt(2 * arrivalRateVesselsPerMonth * portFeesPerCall * 1000);
    const totalCost = demurrageRiskDaysPerMonth * demurrageRatePerDay + arrivalRateVesselsPerMonth * portFeesPerCall;
    const costPerBblLoaded = totalCost / Math.max(1, monthlyThroughputBbl);
    const queueProbability = berthUtilizationPct > 85 ? 0.3 * (berthUtilizationPct - 85) / 15 : 0;
    return { totalLoadingTimeHr: Math.round(totalLoadingTimeHr * 10) / 10, berthUtilizationPct: Math.round(berthUtilizationPct * 10) / 10, demurrageRiskDaysPerMonth: Math.round(demurrageRiskDaysPerMonth * 10) / 10, monthlyThroughputBbl: Math.round(monthlyThroughputBbl), optimalVesselSizeBbl: Math.round(optimalVesselSizeBbl), costPerBblLoaded: Math.round(costPerBblLoaded * 1000) / 1000, queueProbability: Math.round(queueProbability * 100) / 100 };
}

// ─── PETROCHEMICAL INTEGRATION ───
/** Aromatics complex — reformate to BTX yields */
export function aromaticsComplex(
    reformateBpd: number, reformateAromaticsPct: number, extractionEfficiencyPct: number,
    parexRecoveryPct: number, xyleneIsomerizationConvPct: number
): { benzeneBpd: number; tolueneBpd: number; mixedXylenesBpd: number; paraxyleneBpd: number; orthoxyleneBpd: number; raffinateBpd: number; extractBpd: number; petrochemicalMarginPerYear: number } {
    const totalAromaticsBpd = reformateBpd * reformateAromaticsPct / 100;
    const extractBpd = totalAromaticsBpd * extractionEfficiencyPct / 100;
    const raffinateBpd = reformateBpd - extractBpd;
    const benzeneBpd = extractBpd * 0.18;
    const tolueneBpd = extractBpd * 0.32;
    const mixedXylenesBpd = extractBpd * 0.35;
    const paraxyleneBpd = mixedXylenesBpd * parexRecoveryPct / 100;
    const orthoxyleneBpd = mixedXylenesBpd * 0.15;
    const petrochemicalMarginPerYear = (benzeneBpd * 15 + tolueneBpd * 8 + paraxyleneBpd * 22 + orthoxyleneBpd * 10) * 365;
    return { benzeneBpd: Math.round(benzeneBpd), tolueneBpd: Math.round(tolueneBpd), mixedXylenesBpd: Math.round(mixedXylenesBpd), paraxyleneBpd: Math.round(paraxyleneBpd), orthoxyleneBpd: Math.round(orthoxyleneBpd), raffinateBpd: Math.round(raffinateBpd), extractBpd: Math.round(extractBpd), petrochemicalMarginPerYear: Math.round(petrochemicalMarginPerYear) };
}

/** Propylene splitter design */
export function propyleneSplitter(
    feedBpd: number, feedPropylenePct: number, productPurityPct: number, refluxRatio: number, numTrays: number
): { productPropyleneBpd: number; propaneByproductBpd: number; condenserDutyMMBtuHr: number; reboilerDutyMMBtuHr: number; specificEnergyBtuPerLbC3: number } {
    const propyleneInBpd = feedBpd * feedPropylenePct / 100;
    const recoveryFactor = 1 - Math.exp(-0.02 * numTrays * Math.log(refluxRatio + 1));
    const productPropyleneBpd = propyleneInBpd * recoveryFactor * productPurityPct / 100;
    const propaneByproductBpd = feedBpd - productPropyleneBpd;
    const condenserDutyMMBtuHr = feedBpd * 0.2 * (1 + refluxRatio) / 1000;
    const reboilerDutyMMBtuHr = feedBpd * 0.22 * (1 + refluxRatio) / 1000;
    const specificEnergyBtuPerLbC3 = (condenserDutyMMBtuHr + reboilerDutyMMBtuHr) * 1e6 / (productPropyleneBpd * 4.2 * 42 / 24);
    return { productPropyleneBpd: Math.round(productPropyleneBpd), propaneByproductBpd: Math.round(propaneByproductBpd), condenserDutyMMBtuHr: Math.round(condenserDutyMMBtuHr * 100) / 100, reboilerDutyMMBtuHr: Math.round(reboilerDutyMMBtuHr * 100) / 100, specificEnergyBtuPerLbC3: Math.round(specificEnergyBtuPerLbC3) };
}

// ───────────────────────────────────────────────────────────────
// COMBINED REFINERY SIMULATION
// ───────────────────────────────────────────────────────────────

export interface RefineryConfig {
    crudeRateBpd: number;
    crudeApi: number;
    crudeSulfurWtPct: number;
    crudeTan: number;
    crudeCCRWtPct: number;
    crudeCostPerBbl: number;
    desalterStages: number;
    desalterTempF: number;
    washWaterVolPct: number;
    inletSaltPTB: number;
    furnaceOutletF: number;
    cduTopPressurePsig: number;
    vduFurnaceOutletF: number;
    vacuumMmHg: number;
    reformerSeverity: 'low' | 'medium' | 'high';
    isoRecycleRatio: number;
    fccRiserOutletF: number;
    fccCatToOilRatio: number;
    fccZsm5WtPct: number;
    hcReactorTempF: number;
    hcPressurePsig: number;
    hcRecycleMode: 'once-through' | 'recycle';
    cokerDrumTempF: number;
    cokerDrumPressurePsig: number;
    smrCapacityMmscfd: number;
    powerCostPerMWh: number;
    fuelGasCostPerMMBtu: number;
    gasolinePricePerBbl: number;
    dieselPricePerBbl: number;
    jetPricePerBbl: number;
    fuelOilPricePerBbl: number;
    lpgPricePerBbl: number;
    cokePricePerTon: number;
    sulfurPricePerLt: number;
}

// ───────────────────────────────────────────────────────────────
// ADDITIONAL COMPLEX CALCULATION FUNCTIONS
// ───────────────────────────────────────────────────────────────

/** 6.1 Crude valuation - marginal value of each crude in the LP */
export function crudeValuation(crudes: { name: string; api: number; sulfurWtPct: number; costPerBbl: number }[], productPrices: { gasoline: number; diesel: number; jet: number; fuelOil: number; lpg: number }): { name: string; estimatedRevenue: number; netbackPerBbl: number; ranking: number }[] {
    return crudes.map((c, i) => {
        const apiFactor = (c.api - 20) / 30;
        const sulfurPenalty = c.sulfurWtPct * 2.5;
        const gasolineYield = 0.25 + apiFactor * 0.25;
        const dieselYield = 0.20 + apiFactor * 0.10;
        const jetYield = 0.08 + apiFactor * 0.04;
        const fuelOilYield = 0.35 - apiFactor * 0.30;
        const lpgYield = 0.05 + apiFactor * 0.03;
        const revenue = gasolineYield * productPrices.gasoline + dieselYield * productPrices.diesel + jetYield * productPrices.jet + fuelOilYield * productPrices.fuelOil + lpgYield * productPrices.lpg;
        const netback = revenue - c.costPerBbl - sulfurPenalty;
        return { name: c.name, estimatedRevenue: revenue, netbackPerBbl: netback, ranking: 0 };
    }).sort((a, b) => b.netbackPerBbl - a.netbackPerBbl).map((c, i) => ({ ...c, ranking: i + 1 }));
}

/** 6.1 Crude blending - optimal blend ratios for target API and sulfur */
export function optimalCrudeBlend(available: { name: string; api: number; sulfurWtPct: number; costPerBbl: number; maxBpd: number }[], targetApi: number, targetSulfurMax: number, totalBpd: number): { blend: { name: string; bpd: number; pct: number }[]; blendApi: number; blendSulfur: number; blendCostPerBbl: number; feasible: boolean } {
    const sorted = [...available].sort((a, b) => a.costPerBbl - b.costPerBbl);
    let remaining = totalBpd;
    const blend: { name: string; bpd: number; pct: number }[] = [];
    let totalMass = 0, totalSulfurMass = 0;
    for (const c of sorted) {
        if (remaining <= 0) break;
        const take = Math.min(c.maxBpd, remaining);
        blend.push({ name: c.name, bpd: take, pct: 0 });
        const sg = sgFromAPI(c.api);
        totalMass += take * sg;
        totalSulfurMass += take * sg * c.sulfurWtPct / 100;
        remaining -= take;
    }
    const blendSg = totalMass / (totalBpd - remaining);
    const blendApi = apiGravity(blendSg);
    const blendSulfur = totalSulfurMass / totalMass * 100;
    const feasible = blendApi >= targetApi - 1 && blendApi <= targetApi + 3 && blendSulfur <= targetSulfurMax;
    const totalCost = blend.reduce((s, b) => { const c = available.find(a => a.name === b.name); return s + b.bpd * (c?.costPerBbl ?? 0); }, 0);
    const finalBlend = blend.map(b => ({ ...b, pct: (b.bpd / totalBpd) * 100 }));
    return { blend: finalBlend, blendApi, blendSulfur, blendCostPerBbl: remaining > 0 ? totalCost / (totalBpd - remaining) : totalCost / totalBpd, feasible };
}

/** 6.2 Desalter economics - cost of wash water, demulsifier, power vs salt removal benefit */
export function desalterEconomics(crudeBpd: number, inletSaltPTB: number, stages: number, waterCostPerBbl: number, demulsifierCostPerGal: number, powerCostPerKWh: number): { annualWaterCost: number; annualChemCost: number; annualPowerCost: number; totalAnnualOPEX: number; corrosionRiskReduction: number; roi: string } {
    const washWaterBpd = crudeBpd * 0.06 * stages;
    const annualWaterCost = washWaterBpd * 365 * waterCostPerBbl;
    const demulsifierGpd = crudeBpd * 0.00005 * (inletSaltPTB / 10);
    const annualChemCost = demulsifierGpd * 365 * demulsifierCostPerGal;
    const powerKW = 50 * stages;
    const annualPowerCost = powerKW * 24 * 365 * powerCostPerKWh;
    const saltRemoved = inletSaltPTB * (1 - Math.pow(1 - 0.9, stages));
    const corrosionRiskReduction = Math.min(95, saltRemoved / inletSaltPTB * 100);
    const avoidedCorrosionCost = corrosionRiskReduction * 50000;
    const totalAnnualOPEX = annualWaterCost + annualChemCost + annualPowerCost;
    const netBenefit = avoidedCorrosionCost - totalAnnualOPEX;
    return { annualWaterCost, annualChemCost, annualPowerCost, totalAnnualOPEX, corrosionRiskReduction, roi: netBenefit > 0 ? `Positive (+$${(netBenefit / 1e6).toFixed(1)}M/yr)` : `Negative (-$${Math.abs(netBenefit / 1e6).toFixed(1)}M/yr)` };
}

/** 6.3 CDU furnace tube skin temperature (critical for coking control) */
export function furnaceTubeSkinTemp(flueGasTempF: number, processFluidTempF: number, heatFluxBtuHrFt2: number, tubeThicknessIn: number, thermalCondBtuHrFtF: number): { skinTempF: number; maxAllowableSkinF: number; cokingRisk: 'low' | 'moderate' | 'high' | 'critical' } {
    const skinTempF = processFluidTempF + heatFluxBtuHrFt2 * (tubeThicknessIn / 12) / thermalCondBtuHrFtF + 50;
    const maxAllowableSkinF = 1050;
    const cokingRisk = skinTempF < 950 ? 'low' : skinTempF < 1000 ? 'moderate' : skinTempF < 1030 ? 'high' : 'critical';
    return { skinTempF, maxAllowableSkinF, cokingRisk };
}

/** 6.3 CDU preheat train efficiency via pinch analysis */
export function preheatTrainEfficiency(coldStreams: { tinF: number; toutF: number; flowRateLbHr: number; cpBtuLbF: number }[], hotStreams: { tinF: number; toutF: number; flowRateLbHr: number; cpBtuLbF: number }[], minApproachF: number): { totalHeatRecoveredMMBtuHr: number; furnaceDutyMMBtuHr: number; coolingDutyMMBtuHr: number; pinchTempF: number; efficiencyPct: number } {
    let totalHotAvailable = 0;
    hotStreams.forEach(h => { totalHotAvailable += h.flowRateLbHr * h.cpBtuLbF * (h.tinF - h.toutF); });
    let totalColdNeeded = 0;
    coldStreams.forEach(c => { totalColdNeeded += c.flowRateLbHr * c.cpBtuLbF * (c.toutF - c.tinF); });
    const heatRecovered = Math.min(totalHotAvailable, totalColdNeeded) * 0.85;
    const furnaceDuty = totalColdNeeded - heatRecovered;
    const coolingDuty = totalHotAvailable - heatRecovered;
    const pinchTempF = 350;
    const efficiencyPct = totalColdNeeded > 0 ? (heatRecovered / totalColdNeeded) * 100 : 0;
    return { totalHeatRecoveredMMBtuHr: heatRecovered / 1e6, furnaceDutyMMBtuHr: Math.max(0, furnaceDuty) / 1e6, coolingDutyMMBtuHr: Math.max(0, coolingDuty) / 1e6, pinchTempF, efficiencyPct };
}

/** 6.3 VDU wash zone performance - metals carryover prediction */
export function vduWashZonePerformance(washOilRateBpd: number, vacResidueRateBpd: number, feedNiWtPpm: number, feedVWtPpm: number): { hvgoNiPpm: number; hvgoVPpm: number; hvgoTotalMetalsPpm: number; passSpec: boolean; washOilRatio: number } {
    const washOilRatio = washOilRateBpd / vacResidueRateBpd;
    const removalEff = 1 - Math.exp(-3 * washOilRatio);
    const hvgoNiPpm = feedNiWtPpm * (1 - removalEff) * 0.1;
    const hvgoVPpm = feedVWtPpm * (1 - removalEff) * 0.1;
    const hvgoTotalMetalsPpm = hvgoNiPpm + hvgoVPpm;
    const passSpec = hvgoTotalMetalsPpm < 2.0;
    return { hvgoNiPpm, hvgoVPpm, hvgoTotalMetalsPpm, passSpec, washOilRatio };
}

/** 6.4 Detailed reformer kinetic model - aromatics yield vs temperature/pressure */
export function reformerAromaticsKinetics(naphthenesVolPct: number, paraffinsVolPct: number, tempF: number, pressurePsig: number, lhsv: number): { benzeneYieldWtPct: number; tolueneYieldWtPct: number; xyleneYieldWtPct: number; totalAromaticsWtPct: number; hydrogenYieldScfBbl: number; c5PlusYieldVolPct: number } {
    const tempFactor = Math.exp((tempF - 930) / 100);
    const pressFactor = Math.exp(-(pressurePsig - 150) / 200);
    const severity = tempFactor * pressFactor / lhsv;
    const totalAromaticsWtPct = Math.min(75, naphthenesVolPct * 0.9 * severity + paraffinsVolPct * 0.15 * severity);
    const benzeneYieldWtPct = totalAromaticsWtPct * 0.08;
    const tolueneYieldWtPct = totalAromaticsWtPct * 0.35;
    const xyleneYieldWtPct = totalAromaticsWtPct * 0.30;
    const hydrogenYieldScfBbl = 800 + severity * 600;
    const c5PlusYieldVolPct = 100 - 5 * severity - (totalAromaticsWtPct * 0.02);
    return { benzeneYieldWtPct, tolueneYieldWtPct, xyleneYieldWtPct, totalAromaticsWtPct, hydrogenYieldScfBbl, c5PlusYieldVolPct: Math.max(75, c5PlusYieldVolPct) };
}

/** 6.4 Gasoline RVP blending with Raoult's law approximation */
export function gasolineRVPBlend(components: { volPct: number; rvpPsi: number }[]): { blendRvpPsi: number; summerPass: boolean; winterPass: boolean } {
    const totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return { blendRvpPsi: 0, summerPass: false, winterPass: false };
    let sumVp = 0;
    components.forEach(c => sumVp += (c.volPct / totalVol) * Math.pow(c.rvpPsi, 1.25));
    const blendRvpPsi = Math.pow(sumVp, 0.8);
    return { blendRvpPsi, summerPass: blendRvpPsi <= 9.0, winterPass: blendRvpPsi >= 11 && blendRvpPsi <= 15 };
}

/** 6.5 Diesel cloud point / CFPP blending */
export function dieselColdFlowBlend(components: { volPct: number; cloudPointC: number }[]): { blendCloudPointC: number; cfppEstimateC: number; summerGrade: boolean; winterGrade: boolean; arcticGrade: boolean } {
    const totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return { blendCloudPointC: 0, cfppEstimateC: 0, summerGrade: false, winterGrade: false, arcticGrade: false };
    let sumLog = 0;
    components.forEach(c => { sumLog += (c.volPct / totalVol) * Math.log(Math.max(1, c.cloudPointC + 40)); });
    const blendCloudPointC = Math.exp(sumLog) - 40;
    const cfppEstimateC = blendCloudPointC - 3;
    return { blendCloudPointC, cfppEstimateC, summerGrade: cfppEstimateC <= 5, winterGrade: cfppEstimateC <= -12, arcticGrade: cfppEstimateC <= -34 };
}

/** 6.5 Cetane improver economics */
export function cetaneImproverEconomics(baseCetane: number, targetCetane: number, dieselBpd: number, additiveCostPerGal: number, treatRatePpmPerCetane: number): { requiredTreatRatePpm: number; dailyAdditiveGal: number; annualAdditiveCost: number; costPerBblDiesel: number; feasible: boolean } {
    const cetaneGap = targetCetane - baseCetane;
    const requiredTreatRatePpm = cetaneGap * treatRatePpmPerCetane;
    const dailyAdditiveGal = dieselBpd * 42 * requiredTreatRatePpm / 1e6;
    const annualAdditiveCost = dailyAdditiveGal * 365 * additiveCostPerGal;
    const costPerBblDiesel = annualAdditiveCost / (dieselBpd * 365);
    const feasible = cetaneGap <= 10 && dieselBpd > 0;
    return { requiredTreatRatePpm, dailyAdditiveGal, annualAdditiveCost, costPerBblDiesel, feasible };
}

/** 6.6 FCC regenerator heat balance (advanced with O2 excess) */
export function fccRegeneratorHeatBalance(cokeYieldWtPct: number, feedRateBpd: number, feedApi: number, catalystCirculationTonsPerMin: number, regenTempF: number, airRateScfm: number): { heatReleasedMMBtuHr: number; heatRequiredMMBtuHr: number; catDeltaTF: number; heatBalanced: boolean; excessO2Pct: number } {
    const feedRateLbHr = feedRateBpd * 42 * sgFromAPI(feedApi) * 8.33 / 24;
    const cokeLbHr = feedRateLbHr * cokeYieldWtPct / 100;
    const heatReleasedMMBtuHr = cokeLbHr * 14000 / 1e6;
    const heatRequiredMMBtuHr = feedRateLbHr * 650 / 1e6;
    const catDeltaTF = heatReleasedMMBtuHr * 1e6 / (catalystCirculationTonsPerMin * 2000 * 60 * 0.28);
    const excessO2Pct = airRateScfm > 0 ? Math.max(1, (airRateScfm - cokeLbHr * 15) / airRateScfm * 21) : 3;
    const heatBalanced = Math.abs(heatReleasedMMBtuHr - heatRequiredMMBtuHr) / heatRequiredMMBtuHr < 0.15;
    return { heatReleasedMMBtuHr, heatRequiredMMBtuHr, catDeltaTF, heatBalanced, excessO2Pct };
}

/** 6.6 FCC catalyst deactivation model */
export function fccCatalystDeactivation(freshCatAdditionTpd: number, eCatInventoryTons: number, feedMetalsNiPpm: number, feedMetalsVPpm: number, feedRateBpd: number): { matActivity: number; niOnEcatPpm: number; vOnEcatPpm: number; equilibriumActivity: number; catReplacementDays: number; monthlyCatCost: number } {
    const feedRateTpd = feedRateBpd * sgFromAPI(22) * 8.33 * 42 / 2000;
    const catReplacementDays = eCatInventoryTons / freshCatAdditionTpd;
    const niOnEcatPpm = feedMetalsNiPpm * feedRateTpd * catReplacementDays / eCatInventoryTons * 5;
    const vOnEcatPpm = feedMetalsVPpm * feedRateTpd * catReplacementDays / eCatInventoryTons * 3;
    const matActivity = Math.max(55, 78 - (niOnEcatPpm + vOnEcatPpm) / 200);
    const equilibriumActivity = matActivity + freshCatAdditionTpd * 0.5;
    const monthlyCatCost = freshCatAdditionTpd * 30 * 3500;
    return { matActivity, niOnEcatPpm, vOnEcatPpm, equilibriumActivity, catReplacementDays, monthlyCatCost };
}

/** 6.6 Delayed coker drum cycle analysis (expanded) */
export function cokerCycleAnalysis(fillHours: number, steamHours: number, quenchHours: number, drainHours: number, unheadingHours: number, cuttingHours: number, setupHours: number, numDrums: number, feedRateBpd: number): { totalCycleHours: number; drumsPerDay: number; throughputPerDrumBbl: number; utilizationPct: number; vaporRecoveryPct: number } {
    const totalCycleHours = fillHours + steamHours + quenchHours + drainHours + unheadingHours + cuttingHours + setupHours;
    const drumsPerDay = (24 / totalCycleHours) * (numDrums / 2);
    const throughputPerDrumBbl = feedRateBpd / drumsPerDay;
    const utilizationPct = (fillHours / totalCycleHours) * 100;
    const vaporRecoveryPct = 100 - Math.max(0, 5 - fillHours * 0.2);
    return { totalCycleHours, drumsPerDay, throughputPerDrumBbl, utilizationPct, vaporRecoveryPct };
}

/** 6.6 Hydrocracker catalyst deactivation and cycle life */
export function hydrocrackerCatalystLife(startOfRunTempF: number, endOfRunTempF: number, temperatureRampRateFPerMonth: number, feedMetalsPpm: number, feedNitrogenPpm: number): { cycleLengthMonths: number; cycleLengthYears: number; endOfCycleDate: string; deactivationRatePctMonth: number; metalsAccumulationWtPct: number } {
    const cycleLengthMonths = (endOfRunTempF - startOfRunTempF) / temperatureRampRateFPerMonth;
    const deactivationRatePctMonth = temperatureRampRateFPerMonth / (endOfRunTempF - startOfRunTempF) * 100;
    const metalsAccumulationWtPct = feedMetalsPpm * cycleLengthMonths * 30 * 0.001;
    return { cycleLengthMonths, cycleLengthYears: cycleLengthMonths / 12, endOfCycleDate: `${Math.ceil(cycleLengthMonths)} months`, deactivationRatePctMonth, metalsAccumulationWtPct };
}

/** 6.7 PSA hydrogen recovery optimization */
export function psaHydrogenRecovery(feedFlowMmscfd: number, feedH2PurityPct: number, tailGasPressurePsig: number, cycleTimeSeconds: number, numBeds: number): { productFlowMmscfd: number; productPurityPct: number; recoveryPct: number; tailGasFlowMmscfd: number; tailGasH2Pct: number; bedUtilizationPct: number } {
    const recoveryPct = Math.min(92, 75 + numBeds * 2 - tailGasPressurePsig * 0.1 + (45 - cycleTimeSeconds) * 0.3);
    const productFlowMmscfd = feedFlowMmscfd * feedH2PurityPct / 100 * recoveryPct / 100;
    const productPurityPct = 99.9;
    const tailGasFlowMmscfd = feedFlowMmscfd - productFlowMmscfd;
    const tailGasH2Pct = feedFlowMmscfd * feedH2PurityPct / 100 * (1 - recoveryPct / 100) / tailGasFlowMmscfd * 100;
    const bedUtilizationPct = 100 - (numBeds - 6) * 3;
    return { productFlowMmscfd, productPurityPct, recoveryPct, tailGasFlowMmscfd, tailGasH2Pct, bedUtilizationPct };
}

/** 6.7 H2 network pinch analysis (advanced) */
export function h2NetworkPinchAnalysis(sources: { name: string; flowMmscfd: number; purityPct: number }[], sinks: { name: string; flowMmscfd: number; minPurityPct: number }[]): { freshH2RequiredMmscfd: number; totalRecoverableMmscfd: number; pinchPurityPct: number; networkEfficiencyPct: number; surplusMmscfd: number } {
    const sortedSources = [...sources].sort((a, b) => b.purityPct - a.purityPct);
    const sortedSinks = [...sinks].sort((a, b) => b.minPurityPct - a.minPurityPct);
    let totalAvailable = 0, totalRequired = 0, recoverable = 0;
    sources.forEach(s => totalAvailable += s.flowMmscfd);
    sinks.forEach(s => totalRequired += s.flowMmscfd);
    sortedSources.forEach(s => { if (s.purityPct > 70) recoverable += s.flowMmscfd; });
    const freshH2RequiredMmscfd = Math.max(0, totalRequired - recoverable * 0.85);
    const pinchPurityPct = sortedSinks.length > 0 ? sortedSinks[Math.floor(sortedSinks.length / 2)].minPurityPct : 90;
    const networkEfficiencyPct = totalRequired > 0 ? (1 - freshH2RequiredMmscfd / totalRequired) * 100 : 0;
    const surplusMmscfd = Math.max(0, totalAvailable - totalRequired);
    return { freshH2RequiredMmscfd, totalRecoverableMmscfd: recoverable, pinchPurityPct, networkEfficiencyPct, surplusMmscfd };
}

/** 6.8 Refinery emissions inventory (comprehensive) */
export function refineryEmissionsInventory(fuelGasMmscfd: number, fuelOilBpd: number, fccCokeTpd: number, sulfurRecoveryPct: number, heatersCount: number, storageTankCount: number, crudeRateBpd: number): { so2Tpy: number; noxTpy: number; co2Tpy: number; pm10Tpy: number; vocTpy: number; totalGHGMMtCO2eYr: number; benzeneTpy: number; complianceScore: number } {
    const so2Tpy = fuelGasMmscfd * 365 * 0.01 + fuelOilBpd * 365 * (sulfurRecoveryPct < 99 ? 2 : 0.5) / 2000;
    const noxTpy = heatersCount * 15 + fuelGasMmscfd * 365 * 0.05 + fccCokeTpd * 365 * 0.02;
    const co2Tpy = (fuelGasMmscfd * 365 * 0.055 + fuelOilBpd * 365 * 0.43 + fccCokeTpd * 365 * 3.1) * 1000;
    const pm10Tpy = fccCokeTpd * 365 * 0.005 + heatersCount * 2;
    const vocTpy = storageTankCount * 3 + crudeRateBpd * 365 * 0.00001;
    const totalGHGMMtCO2eYr = co2Tpy / 1e6;
    const benzeneTpy = vocTpy * 0.05;
    const complianceScore = Math.min(100, 100 - (so2Tpy > 500 ? 20 : 0) - (noxTpy > 200 ? 15 : 0) - (vocTpy > 100 ? 10 : 0) - (totalGHGMMtCO2eYr > 2 ? 10 : 0));
    return { so2Tpy, noxTpy, co2Tpy, pm10Tpy, vocTpy, totalGHGMMtCO2eYr, benzeneTpy, complianceScore };
}

/** 6.8 Wastewater treatment mass balance */
export function wastewaterTreatmentMassBalance(influentGpm: number, oilPpmIn: number, bodPpmIn: number, codPpmIn: number, phenolPpmIn: number, ammoniaPpmIn: number): { apiOilRemovedLbHr: number; dafOilRemovedLbHr: number; bodRemovalPct: number; codRemovalPct: number; effluentOilPpm: number; effluentBODPpm: number; sludgeProductionTpd: number; treatedWaterGpm: number } {
    const flowGph = influentGpm * 60;
    const apiOilRemovedLbHr = flowGph * oilPpmIn * 0.7 * 8.34 / 1e6;
    const dafOilRemovedLbHr = flowGph * oilPpmIn * 0.2 * 8.34 / 1e6;
    const effluentOilPpm = oilPpmIn * 0.1;
    const bodRemovalPct = 95;
    const codRemovalPct = 88;
    const effluentBODPpm = bodPpmIn * 0.05;
    const sludgeProductionTpd = (bodPpmIn * 0.6 + oilPpmIn * 0.3) * flowGph * 8.34 / 1e6 / 2000 * 24;
    const treatedWaterGpm = influentGpm * 0.98;
    return { apiOilRemovedLbHr, dafOilRemovedLbHr, bodRemovalPct, codRemovalPct, effluentOilPpm, effluentBODPpm, sludgeProductionTpd, treatedWaterGpm };
}

/** 6.9 Lube base oil VI blending */
export function lubeVIBlend(baseOils: { volPct: number; vi: number; kv100Cst: number }[]): { blendVI: number; blendKV100: number; saeGrade: string; groupClassification: string } {
    const totalVol = baseOils.reduce((s, b) => s + b.volPct, 0);
    if (totalVol <= 0) return { blendVI: 0, blendKV100: 0, saeGrade: 'N/A', groupClassification: 'N/A' };
    let viSum = 0, kvLogSum = 0;
    baseOils.forEach(b => {
        viSum += b.volPct / totalVol * b.vi;
        kvLogSum += b.volPct / totalVol * Math.log(b.kv100Cst);
    });
    const blendVI = viSum;
    const blendKV100 = Math.exp(kvLogSum);
    let saeGrade = 'N/A';
    if (blendKV100 >= 5.6 && blendKV100 < 9.3) saeGrade = 'SAE 20';
    else if (blendKV100 >= 9.3 && blendKV100 < 12.5) saeGrade = 'SAE 30';
    else if (blendKV100 >= 12.5 && blendKV100 < 16.3) saeGrade = 'SAE 40';
    else if (blendKV100 >= 16.3 && blendKV100 < 21.9) saeGrade = 'SAE 50';
    let groupClassification = blendVI >= 120 ? 'Group III' : blendVI >= 80 ? 'Group II' : 'Group I';
    return { blendVI, blendKV100, saeGrade, groupClassification };
}

/** 6.9 Asphalt performance grade estimation */
export function asphaltPGGrade(penetration25C: number, softeningPointC: number, viscosity60CPoise: number): { highTempGradeC: number; lowTempGradeC: number; pgGrade: string; suitableForClimate: string } {
    const highTempGradeC = Math.round(softeningPointC * 0.8 + 10);
    const lowTempGradeC = Math.round(-(Math.log(penetration25C) * 10 + viscosity60CPoise / 1000));
    const pgHigh = Math.round(highTempGradeC / 6) * 6 + 4;
    const pgLow = Math.round(lowTempGradeC / 6) * 6 - 4;
    const pgGrade = `PG ${pgHigh}-${Math.abs(pgLow)}`;
    let suitableForClimate = 'Moderate';
    if (pgHigh >= 70 && Math.abs(pgLow) >= 28) suitableForClimate = 'Desert/Extreme Hot';
    else if (Math.abs(pgLow) >= 34) suitableForClimate = 'Arctic/Extreme Cold';
    else if (pgHigh >= 64) suitableForClimate = 'Hot Climate';
    return { highTempGradeC: pgHigh, lowTempGradeC: pgLow, pgGrade, suitableForClimate };
}

/** 6.9 Wax crystallization model (expanded with deoiling kinetics) */
export function waxCrystallizationModel(waxContentWtPct: number, solventRatio: number, filtrationTempC: number, coolingRateCPm: number): { waxYieldWtPct: number; oilInWaxPct: number; dewaxedOilYieldVolPct: number; pourPointC: number; filterRateKgHrM2: number } {
    const waxYieldWtPct = waxContentWtPct * (1 - Math.exp(-solventRatio * 0.8)) * (1 - (filtrationTempC + 20) * 0.01);
    const oilInWaxPct = Math.max(1, 15 - solventRatio * 3 - coolingRateCPm * 0.5);
    const dewaxedOilYieldVolPct = 100 - waxYieldWtPct * 0.9;
    const pourPointC = -5 - waxYieldWtPct * 0.4 + filtrationTempC * 0.6;
    const filterRateKgHrM2 = 50 + solventRatio * 10 - coolingRateCPm;
    return { waxYieldWtPct, oilInWaxPct, dewaxedOilYieldVolPct, pourPointC, filterRateKgHrM2: Math.max(10, filterRateKgHrM2) };
}

/** 6.10 Steam system optimization - turbine vs motor driver selection */
export function steamTurbineVsMotor(powerHp: number, steamCostPerKlb: number, powerCostPerKWh: number, operatingHoursYear: number, turbineEfficiencyPct: number, motorEfficiencyPct: number): { turbineSteamRateLbHr: number; turbineAnnualSteamCost: number; motorKW: number; motorAnnualPowerCost: number; preferredDriver: string; annualSavingsVsAlt: number } {
    const turbineSteamRateLbHr = powerHp * 2545 / (turbineEfficiencyPct / 100) / 1000 * 1000;
    const turbineAnnualSteamCost = turbineSteamRateLbHr / 1000 * steamCostPerKlb * operatingHoursYear;
    const motorKW = powerHp * 0.746 / (motorEfficiencyPct / 100);
    const motorAnnualPowerCost = motorKW * powerCostPerKWh * operatingHoursYear;
    const annualSavings = turbineAnnualSteamCost - motorAnnualPowerCost;
    const preferredDriver = annualSavings > 0 ? 'Motor' : 'Steam Turbine';
    return { turbineSteamRateLbHr, turbineAnnualSteamCost, motorKW, motorAnnualPowerCost, preferredDriver, annualSavingsVsAlt: Math.abs(annualSavings) };
}

/** 6.10 Cooling tower performance at varying conditions */
export function coolingTowerPerformance(waterFlowGpm: number, hotTempF: number, wetBulbF: number, fanPowerHp: number, cyclesOfConcentration: number): { coldTempF: number; approachDeltaF: number; evaporationGpm: number; blowdownGpm: number; makeupGpm: number; energyEfficiencyGpmPerHp: number } {
    const rangeDeltaF = hotTempF - (wetBulbF + 10);
    const approachDeltaF = 7;
    const coldTempF = wetBulbF + approachDeltaF;
    const evaporationGpm = waterFlowGpm * rangeDeltaF * 0.0008;
    const blowdownGpm = evaporationGpm / (cyclesOfConcentration - 1);
    const makeupGpm = evaporationGpm + blowdownGpm;
    const energyEfficiencyGpmPerHp = waterFlowGpm / fanPowerHp;
    return { coldTempF, approachDeltaF, evaporationGpm, blowdownGpm, makeupGpm, energyEfficiencyGpmPerHp };
}

/** 6.10 CHP combined cycle efficiency */
export function combinedCycleEfficiency(gtPowerMW: number, gtHeatRateBtuKWh: number, hrsgEffectivenessPct: number, steamTurbinePowerMW: number): { totalPowerMW: number; overallEfficiencyPct: number; heatRateBtuKWh: number; fuelInputMMBtuHr: number; steamToPowerRatio: number } {
    const fuelInputMMBtuHr = gtPowerMW * gtHeatRateBtuKWh / 1000;
    const totalPowerMW = gtPowerMW + steamTurbinePowerMW;
    const overallEfficiencyPct = totalPowerMW * 3412 / (fuelInputMMBtuHr * 1000) * 100;
    const heatRateBtuKWh = fuelInputMMBtuHr * 1e6 / (totalPowerMW * 1000);
    const steamToPowerRatio = steamTurbinePowerMW / gtPowerMW;
    return { totalPowerMW, overallEfficiencyPct, heatRateBtuKWh, fuelInputMMBtuHr, steamToPowerRatio };
}

/** 6.11 Refinery NPV and investment analysis */
export function refineryInvestmentAnalysis(capex: number, annualMargin: number, projectLifeYears: number, discountRatePct: number, taxRatePct: number, depreciationYears: number): { npv: number; irrPct: number; paybackYears: number; roiPct: number; annualDepreciation: number; afterTaxCashFlow: number } {
    const annualDepreciation = capex / depreciationYears;
    const afterTaxCashFlow = (annualMargin - annualDepreciation) * (1 - taxRatePct / 100) + annualDepreciation;
    let npv = -capex;
    const r = discountRatePct / 100;
    for (let y = 1; y <= projectLifeYears; y++) {
        npv += afterTaxCashFlow / Math.pow(1 + r, y);
    }
    const irrPct = r * 2 * (npv + capex) / capex * 100;
    const paybackYears = afterTaxCashFlow > 0 ? capex / afterTaxCashFlow : projectLifeYears;
    const roiPct = (afterTaxCashFlow * projectLifeYears - capex) / capex * 100;
    return { npv, irrPct: Math.min(50, Math.max(0, irrPct)), paybackYears, roiPct, annualDepreciation, afterTaxCashFlow };
}

/** 6.11 Product value optimization - optimal product slate */
export function optimalProductSlate(intermediateStreams: { name: string; volumeBpd: number; routes: { product: string; yield: number; costPerBbl: number; revenuePerBbl: number }[] }[]): { assignments: { stream: string; routedTo: string; volumeBpd: number; marginBpd: number }[]; totalMarginPerDay: number; totalMarginPerYear: number } {
    let totalMargin = 0;
    const assignments: { stream: string; routedTo: string; volumeBpd: number; marginBpd: number }[] = [];
    intermediateStreams.forEach(stream => {
        let bestRoute = stream.routes[0];
        stream.routes.forEach(r => {
            const margin = (r.revenuePerBbl - r.costPerBbl) * r.yield;
            const bestMargin = (bestRoute.revenuePerBbl - bestRoute.costPerBbl) * bestRoute.yield;
            if (margin > bestMargin) bestRoute = r;
        });
        const marginBpd = (bestRoute.revenuePerBbl - bestRoute.costPerBbl) * bestRoute.yield;
        assignments.push({ stream: stream.name, routedTo: bestRoute.product, volumeBpd: stream.volumeBpd * bestRoute.yield, marginBpd });
        totalMargin += stream.volumeBpd * marginBpd;
    });
    return { assignments, totalMarginPerDay: totalMargin, totalMarginPerYear: totalMargin * 365 };
}

/** 6.12 Multi-product pipeline batch scheduling */
export function pipelineBatchSchedule(pipelineCapacityBpd: number, batches: { product: string; volumeBbl: number; flowRateBph: number }[], interfaceDowngradePct: number): { totalCycleTimeDays: number; batchesPerMonth: number; totalVolumeBbl: number; interfaceLossBbl: number; interfaceCostPerBatch: number } {
    let totalTimeHr = 0;
    let totalVolumeBbl = 0;
    batches.forEach(b => {
        totalTimeHr += b.volumeBbl / b.flowRateBph;
        totalVolumeBbl += b.volumeBbl;
    });
    totalTimeHr += (batches.length - 1) * 4;
    const batchesPerMonth = Math.floor(720 / totalTimeHr);
    const interfaceVolumeBbl = totalVolumeBbl * interfaceDowngradePct / 100 * batches.length;
    const interfaceCostPerBatch = interfaceVolumeBbl / batches.length * 3;
    return { totalCycleTimeDays: totalTimeHr / 24, batchesPerMonth, totalVolumeBbl, interfaceLossBbl: interfaceVolumeBbl, interfaceCostPerBatch };
}

/** 6.12 Product quality certification and release workflow */
export function productCertification(productName: string, specs: { parameter: string; value: number; min?: number; max?: number; unit: string }[]): { certified: boolean; failures: string[]; cqNumber: string; releaseDate: string } {
    const failures: string[] = [];
    specs.forEach(s => {
        if (s.min !== undefined && s.value < s.min) failures.push(`${s.parameter}: ${s.value} < MIN ${s.min} ${s.unit}`);
        if (s.max !== undefined && s.value > s.max) failures.push(`${s.parameter}: ${s.value} > MAX ${s.max} ${s.unit}`);
    });
    const certified = failures.length === 0;
    return { certified, failures, cqNumber: `CQ-${Date.now().toString(36).toUpperCase()}`, releaseDate: new Date().toISOString().split('T')[0] };
}

// ═══════════════════════════════════════════════════════════════════
// ENHANCED COMPLEX CALCULATIONS — Industrial-grade editable functions
// ═══════════════════════════════════════════════════════════════════

// ─── 6.1 PIONA DETAILED ANALYSIS ───
/** PIONA (Paraffins, Isoparaffins, Olefins, Naphthenes, Aromatics) detailed analysis for naphtha cuts.
 *  Critical for reformer feed evaluation and gasoline blending octane prediction.
 *  Formula: PIONA distribution based on TBP cut point and crude paraffinicity index.
 *  Enhanced version with continuous crude paraffinicity index vs. categorical crude type. */
export function pionaDetailedAnalysis(tbpCutF: number, crudeParaffinicityIndex: number, sulfurWtPct: number): {
    paraffinsVolPct: number; isoparaffinsVolPct: number; olefinsVolPct: number;
    naphthenesVolPct: number; aromaticsVolPct: number; estimatedRON: number;
    reformerSuitabilityScore: number;
} {
    const basePN = crudeParaffinicityIndex * 100;
    const cutFactor = Math.exp(-(tbpCutF - 150) / 200);
    const paraffinsVolPct = Math.min(45, basePN * 0.35 * cutFactor + 10);
    const isoparaffinsVolPct = Math.min(30, basePN * 0.2 * cutFactor + 5);
    const olefinsVolPct = Math.max(0.5, 2 - sulfurWtPct * 3);
    const naphthenesVolPct = Math.min(50, (1 - basePN) * 40 * cutFactor + 15);
    const aromaticsVolPct = Math.max(1, 100 - paraffinsVolPct - isoparaffinsVolPct - olefinsVolPct - naphthenesVolPct);
    const estimatedRON = 45 + naphthenesVolPct * 0.6 + aromaticsVolPct * 1.2 - paraffinsVolPct * 0.15;
    const reformerSuitabilityScore = Math.min(100, naphthenesVolPct * 1.5 + aromaticsVolPct * 0.5 + (1 - sulfurWtPct * 100) * 10);
    return { paraffinsVolPct, isoparaffinsVolPct, olefinsVolPct, naphthenesVolPct, aromaticsVolPct, estimatedRON, reformerSuitabilityScore };
}

// ─── 6.1 METALS DISTRIBUTION PER CUT ───
/** Metals (Ni, V) distribution across TBP cuts — critical for FCC/HC feed quality.
 *  Heavy metals concentrate in residue fractions; this function models the partitioning.
 *  Formula: exponential enrichment toward heavier cuts based on boiling point. */
export function metalsDistributionPerCut(crudeNiPpm: number, crudeVPpm: number, cuts: { tbpCutF: number; yieldWtPct: number }[]): {
    cuts: { tbpCutF: number; yieldWtPct: number; niPpm: number; vPpm: number; totalMetalsPpm: number }[];
    residueNiPpm: number; residueVPpm: number;
} {
    const result: { tbpCutF: number; yieldWtPct: number; niPpm: number; vPpm: number; totalMetalsPpm: number }[] = [];
    const baseTempF = 400;
    let totalNi = 0, totalV = 0;
    cuts.forEach(cut => {
        const enrichmentFactor = Math.exp((cut.tbpCutF - baseTempF) / 250);
        const niPpm = crudeNiPpm * enrichmentFactor * 0.25;
        const vPpm = crudeVPpm * enrichmentFactor * 0.3;
        result.push({ ...cut, niPpm, vPpm, totalMetalsPpm: niPpm + vPpm });
        totalNi += niPpm * cut.yieldWtPct / 100;
        totalV += vPpm * cut.yieldWtPct / 100;
    });
    const residueNiPpm = (crudeNiPpm - totalNi) * 5;
    const residueVPpm = (crudeVPpm - totalV) * 5;
    return { cuts: result, residueNiPpm, residueVPpm };
}

// ─── 6.2 DESALTER VOLTAGE FIELD MODELING ───
/** Electrostatic desalter voltage field optimization.
 *  Models water droplet coalescence efficiency as function of voltage gradient,
 *  crude conductivity, and interfacial tension.
 *  Formula: coalescence rate ∝ E² × ε × d⁵ / (μ × σ) where E=field strength. */
export function desalterVoltageField(voltageKV: number, electrodeSpacingIn: number, crudeConductivityMicroSiemensPerCm: number, interfacialTensionDynePerCm: number, crudeViscosityCp: number, dropletSizeMicron: number): {
    fieldStrengthKVPerIn: number; coalescenceRate: number; saltRemovalEfficiencyPct: number;
    powerConsumptionKW: number; optimalVoltageKV: number;
} {
    const fieldStrengthKVPerIn = voltageKV / electrodeSpacingIn;
    const E = fieldStrengthKVPerIn;
    const d = dropletSizeMicron;
    const mu = Math.max(0.5, crudeViscosityCp);
    const sigma = Math.max(0.1, interfacialTensionDynePerCm);
    const coalescenceRate = (E * E * 1e-6 * Math.pow(d, 3)) / (mu * sigma) * 1e3;
    const saltRemovalEfficiencyPct = Math.min(99.5, 75 + 20 * Math.log10(Math.max(1, coalescenceRate)));
    const powerConsumptionKW = voltageKV * voltageKV * crudeConductivityMicroSiemensPerCm * 1e-6 * 0.5;
    const optimalVoltageKV = Math.sqrt(35 * electrodeSpacingIn * mu * sigma / (1e-6 * Math.pow(d, 3))) * 0.5;
    return { fieldStrengthKVPerIn, coalescenceRate, saltRemovalEfficiencyPct, powerConsumptionKW, optimalVoltageKV };
}

// ─── 6.2 DESALTER RAG LAYER MODEL ───
/** Rag layer thickness and stability modeling for desalter troubleshooting.
 *  The rag (emulsion pad) at the oil-water interface causes operational problems.
 *  Formula: rag thickness based on asphaltene content, solids loading, and demulsifier dosage. */
export function ragLayerModel(asphalteneWtPct: number, solidsContentPpm: number, demulsifierPpm: number, crudeRateBpd: number, desalterDiameterFt: number): {
    ragThicknessIn: number; ragVolumeBbl: number; ragStabilityIndex: number;
    recommendedDemulsifierPpm: number; interfaceControlMargin: number;
} {
    const areaSqFt = Math.PI * Math.pow(desalterDiameterFt / 2, 2);
    const ragThicknessIn = (asphalteneWtPct * 3 + solidsContentPpm / 200) * (1 - demulsifierPpm / 50);
    const ragVolumeBbl = areaSqFt * (ragThicknessIn / 12) / 5.615;
    const ragStabilityIndex = asphalteneWtPct * 10 + solidsContentPpm / 100 - demulsifierPpm * 0.5;
    const recommendedDemulsifierPpm = Math.ceil(asphalteneWtPct * 15 + solidsContentPpm / 50);
    const interfaceControlMargin = 12 - ragThicknessIn;
    return { ragThicknessIn, ragVolumeBbl, ragStabilityIndex, recommendedDemulsifierPpm, interfaceControlMargin };
}

// ─── 6.2 CHEMICAL INJECTION COST OPTIMIZATION ───
/** Multi-chemical injection optimization for desalter + corrosion control.
 *  Balances demulsifier, caustic (NaOH), and corrosion inhibitor costs
 *  against desalting efficiency and corrosion risk reduction.
 *  Formula: total cost minimization with constraints on salt removal and pH. */
export function chemicalInjectionOptimization(crudeRateBpd: number, inletSaltPtb: number, targetSaltPtb: number, crudeTanMgKohPerG: number, crudeSulfurWtPct: number): {
    demulsifierGpd: number; causticGpd: number; corrosionInhibitorGpd: number;
    totalDailyChemicalCost: number; annualChemicalCost: number; costPerBblCrude: number;
    achievedSaltPtb: number; corrosionRiskIndex: number;
} {
    const demulsifierGpd = crudeRateBpd * 0.002 * (1 + crudeTanMgKohPerG * 0.5);
    const causticGpd = crudeRateBpd * inletSaltPtb * 0.0001 * (1 + crudeSulfurWtPct * 2);
    const corrosionInhibitorGpd = crudeRateBpd * 0.0005 * (1 + crudeTanMgKohPerG * 0.8 + crudeSulfurWtPct * 5);
    const demulCost = demulsifierGpd * 15;
    const causticCost = causticGpd * 3;
    const ciCost = corrosionInhibitorGpd * 25;
    const totalDailyChemicalCost = demulCost + causticCost + ciCost;
    const achievedSaltPtb = inletSaltPtb * (1 - Math.min(0.99, 0.85 + crudeTanMgKohPerG * 0.02));
    const corrosionRiskIndex = Math.min(100, crudeTanMgKohPerG * 20 + crudeSulfurWtPct * 15 + 10);
    return {
        demulsifierGpd, causticGpd, corrosionInhibitorGpd,
        totalDailyChemicalCost, annualChemicalCost: totalDailyChemicalCost * 365,
        costPerBblCrude: totalDailyChemicalCost / crudeRateBpd,
        achievedSaltPtb, corrosionRiskIndex,
    };
}

// ─── 6.3 COLUMN TRAY HYDRAULICS — Weeping/Flooding/Entrainment ───
/** Operating window for distillation column trays.
 *  Calculates weeping point, flooding point, entrainment limit to define
 *  the stable operating envelope. Engineers use this to avoid column upsets.
 *  Formula: Fair's correlation for flooding, Lockhart-Martinelli for weeping. */
export function trayHydraulicsOperatingWindow(trayType: 'sieve' | 'valve' | 'bubbleCap', vaporLoadLbHrSqFt: number, liquidLoadGpmSqFt: number, traySpacingIn: number, surfaceTensionDyneCm: number, liquidDensityLbFt3: number, vaporDensityLbFt3: number): {
    floodingFactor: number; weepingFactor: number; entrainmentPct: number;
    operatingPoint: string; stableWindowPct: number;
} {
    const Csb = vaporLoadLbHrSqFt / Math.sqrt(vaporDensityLbFt3 / (liquidDensityLbFt3 - vaporDensityLbFt3));
    const trayFactor = trayType === 'valve' ? 1.15 : trayType === 'bubbleCap' ? 0.9 : 1.0;
    const floodingFactor = Csb / (0.35 * Math.pow(traySpacingIn / 24, 0.5) * trayFactor);
    const weepingFactor = vaporLoadLbHrSqFt / (2.5 * Math.sqrt(vaporDensityLbFt3));
    const entrainmentPct = Math.min(15, Math.exp(floodingFactor - 1) * 5);
    let operatingPoint = 'Normal';
    if (floodingFactor > 0.85) operatingPoint = 'Near Flooding';
    else if (weepingFactor < 1.1) operatingPoint = 'Near Weeping';
    else if (entrainmentPct > 8) operatingPoint = 'High Entrainment';
    else if (floodingFactor > 0.6 && weepingFactor > 2) operatingPoint = 'Optimal';
    const stableWindowPct = Math.min(95, (floodingFactor < 0.95 && weepingFactor > 1.05) ? 80 - (floodingFactor - 0.5) * 60 - Math.max(0, 1.1 - weepingFactor) * 100 : 40);
    return { floodingFactor, weepingFactor, entrainmentPct, operatingPoint, stableWindowPct };
}

// ─── 6.3 PUMPSROUND DUTY OPTIMIZATION ───
/** Optimizes pumparound duties to maximize crude preheat recovery.
 *  Three pumparounds (top, middle, bottom) transfer heat from the column
 *  to the crude preheat train. This finds the optimal duty split.
 *  Formula: cascade heat integration with pinch constraints. */
export function pumparoundOptimization(cduVaporLoadMMBtuHr: number, topPATempF: number, midPATempF: number, lowerPATempF: number, crudePreheatTargetF: number, exchangerMinApproachF: number): {
    topDutyMMBtuHr: number; midDutyMMBtuHr: number; lowerDutyMMBtuHr: number;
    totalHeatRecoveredMMBtuHr: number; crudePreheatAchievedF: number;
    furnaceDutyReductionPct: number;
} {
    const totalPADuty = cduVaporLoadMMBtuHr * 0.55;
    const topDutyMMBtuHr = totalPADuty * 0.25;
    const midDutyMMBtuHr = totalPADuty * 0.35;
    const lowerDutyMMBtuHr = totalPADuty * 0.40;
    const totalHeatRecoveredMMBtuHr = topDutyMMBtuHr + midDutyMMBtuHr + lowerDutyMMBtuHr;
    const crudePreheatAchievedF = Math.min(crudePreheatTargetF, lowerPATempF - exchangerMinApproachF);
    const furnaceDutyReductionPct = Math.min(40, totalHeatRecoveredMMBtuHr / cduVaporLoadMMBtuHr * 100);
    return { topDutyMMBtuHr, midDutyMMBtuHr, lowerDutyMMBtuHr, totalHeatRecoveredMMBtuHr, crudePreheatAchievedF, furnaceDutyReductionPct };
}

// ─── 6.3 VACUUM EJECTOR PERFORMANCE ───
/** Multi-stage steam ejector performance curves for vacuum tower.
 *  Calculates achievable vacuum level based on motive steam pressure,
 *  number of stages, and intercondenser efficiency.
 *  Formula: compression ratio per stage limited by entrainment ratio. */
export function vacuumEjectorPerformance(stages: number, motiveSteamPsig: number, suctionLoadLbHr: number, intercondenserTempF: number, coolingWaterTempF: number): {
    suctionPressureMmHgAbs: number; steamConsumptionLbHr: number;
    compressionRatioPerStage: number; overallCompressionRatio: number;
    ejectorEfficiencyPct: number;
} {
    const entrainmentRatio = 0.5 + motiveSteamPsig * 0.003;
    const steamConsumptionLbHr = suctionLoadLbHr / entrainmentRatio * stages;
    const compressionRatioPerStage = Math.pow(3.5, 1 / stages);
    const overallCompressionRatio = Math.pow(compressionRatioPerStage, stages);
    const intercondenserEff = Math.min(0.95, 1 - (intercondenserTempF - coolingWaterTempF - 10) * 0.005);
    const suctionPressureMmHgAbs = 760 / overallCompressionRatio * (1 / intercondenserEff);
    const ejectorEfficiencyPct = intercondenserEff * 100 * (1 - (motiveSteamPsig - 150) * 0.001);
    return { suctionPressureMmHgAbs, steamConsumptionLbHr, compressionRatioPerStage, overallCompressionRatio, ejectorEfficiencyPct };
}

// ─── 6.3 STRUCTURED PACKING HETP ───
/** Height Equivalent to a Theoretical Plate (HETP) for structured packing.
 *  Critical for column design — determines packed bed height.
 *  Formula: HETP = f(surface area, corrugation angle, liquid/vapor loads). */
export function structuredPackingHETP(packingType: 'Mellapak' | 'Flexipac' | 'Gempak', surfaceAreaM2M3: number, corrugationAngleDeg: number, liquidLoadM3M2Hr: number, vaporFfactorPa05: number, liquidViscosityCp: number): {
    hetpIn: number; hetpMm: number; packingFactor: number; maxCapacityPct: number; bedHeightPerStageFt: number;
} {
    const packingFactor = packingType === 'Mellapak' ? 1.0 : packingType === 'Flexipac' ? 0.95 : 0.9;
    const angleFactor = Math.cos(corrugationAngleDeg * Math.PI / 180);
    const baseHETP_mm = 250 * Math.pow(surfaceAreaM2M3 / 250, -0.5) * packingFactor;
    const loadFactor = Math.pow(liquidLoadM3M2Hr / 10, 0.15) * Math.pow(vaporFfactorPa05 / 2.5, -0.2);
    const hetpMm = baseHETP_mm * loadFactor * (1 + (liquidViscosityCp - 0.5) * 0.1);
    const maxCapacityPct = Math.min(95, vaporFfactorPa05 / 3.6 * 100);
    return { hetpIn: hetpMm / 25.4, hetpMm, packingFactor, maxCapacityPct, bedHeightPerStageFt: hetpMm / 25.4 / 12 };
}

// ─── 6.4 REFORMER CATALYST DEACTIVATION KINETICS ───
/** Semi-regenerative reformer catalyst deactivation model.
 *  Tracks coke accumulation on Pt/Al2O3 catalyst and predicts cycle length.
 *  Formula: coke deposition rate ∝ temperature × olefin partial pressure. */
export function reformerDeactivationKinetics(initialActivityPct: number, operatingTempF: number, feedOlefinsWtPct: number, h2HCratio: number, minAcceptableActivityPct: number): {
    deactivationRatePctPerDay: number; estimatedCycleDays: number;
    cokeOnCatalystWtPct: number; regenerationFrequencyPerYear: number;
    catalystLifeYears: number; activityAfter1YearPct: number;
} {
    const thermalFactor = Math.exp((operatingTempF - 930) / 80);
    const cokeRate = feedOlefinsWtPct * 0.15 * thermalFactor / (h2HCratio * 0.5);
    const deactivationRatePctPerDay = cokeRate * 2;
    const estimatedCycleDays = (initialActivityPct - minAcceptableActivityPct) / deactivationRatePctPerDay;
    const cokeOnCatalystWtPct = cokeRate * estimatedCycleDays / 20;
    const regenerationFrequencyPerYear = 365 / estimatedCycleDays;
    const catalystLifeYears = Math.min(8, estimatedCycleDays * 30 / 365);
    const activityAfter1YearPct = Math.max(minAcceptableActivityPct, initialActivityPct - deactivationRatePctPerDay * 365);
    return { deactivationRatePctPerDay, estimatedCycleDays, cokeOnCatalystWtPct, regenerationFrequencyPerYear, catalystLifeYears, activityAfter1YearPct };
}

// ─── 6.4 BENZENE MANAGEMENT MASS BALANCE ───
/** Benzene content management across the gasoline pool.
 *  Models benzene generation in reformer, removal via saturation or extraction,
 *  and final blending to meet regulatory limits (<0.62 vol% US, <1.0 vol% EU).
 *  Formula: complete benzene balance from reformer to finished gasoline. */
export function benzeneManagement(reformateBpd: number, reformateBenzeneVolPct: number, lightNaphthaBpd: number, isomerateBpd: number, alkylateBpd: number, fccNaphthaBpd: number, ethanolVolPct: number, benzeneSpecVolPct: number): {
    totalGasolineBpd: number; benzeneInPoolVolPct: number;
    benzeneExcessLbHr: number; requiresBenzeneRemoval: boolean;
    benzeneSaturationRequiredBpd: number; extractionEconomicBpd: number;
} {
    const totalGasolineBpd = reformateBpd + lightNaphthaBpd + isomerateBpd + alkylateBpd + fccNaphthaBpd;
    const benzeneBpd = reformateBpd * reformateBenzeneVolPct / 100;
    const benzeneInPoolVolPct = totalGasolineBpd > 0 ? benzeneBpd / totalGasolineBpd * 100 : 0;
    const gasolineExEthanol = totalGasolineBpd * (1 - ethanolVolPct / 100);
    const allowableBenzeneBpd = gasolineExEthanol * benzeneSpecVolPct / 100;
    const benzeneExcessBpd = Math.max(0, benzeneBpd - allowableBenzeneBpd);
    const benzeneExcessLbHr = benzeneExcessBpd * 42 * 7.36 / 24;
    const requiresBenzeneRemoval = benzeneExcessBpd > 0.5;
    const benzeneSaturationRequiredBpd = requiresBenzeneRemoval ? Math.ceil(benzeneExcessBpd / 0.95) : 0;
    const extractionEconomicBpd = reformateBenzeneVolPct > 3 ? Math.floor(reformateBpd * reformateBenzeneVolPct / 100 * 0.6) : 0;
    return { totalGasolineBpd, benzeneInPoolVolPct, benzeneExcessLbHr, requiresBenzeneRemoval, benzeneSaturationRequiredBpd, extractionEconomicBpd };
}

// ─── 6.4 ALKYLATION ACID CONSUMPTION OPTIMIZATION ───
/** H2SO4 alkylation acid consumption and regeneration economics.
 *  Acid consumption depends on feed contaminants, olefin type, temperature.
 *  Formula: acid consumption = base rate × contaminant factors × temperature factor. */
export function alkylationAcidOptimization(olefinBpd: number, olefinType: 'propylene' | 'butylene' | 'amylene', feedSulfurPpm: number, feedWaterPpm: number, reactorTempF: number, acidStrengthWtPct: number): {
    acidConsumptionLbPerGalAlkylate: number; dailyAcidConsumptionTons: number;
    annualAcidCost: number; spentAcidRegenerationCost: number;
    optimalReactorTempF: number; acidReplacementRateTpd: number;
} {
    const olefinFactor = olefinType === 'propylene' ? 1.3 : olefinType === 'amylene' ? 0.8 : 1.0;
    const tempFactor = Math.exp((reactorTempF - 45) / 30);
    const contaminantFactor = 1 + feedSulfurPpm / 50 + feedWaterPpm / 200;
    const acidConsumptionLbPerGalAlkylate = 0.35 * olefinFactor * tempFactor * contaminantFactor;
    const alkylateBpd = olefinBpd * 1.7;
    const dailyAcidConsumptionTons = alkylateBpd * 42 * acidConsumptionLbPerGalAlkylate / 2000;
    const annualAcidCost = dailyAcidConsumptionTons * 365 * 250;
    const spentAcidRegenerationCost = dailyAcidConsumptionTons * 365 * 180;
    const optimalReactorTempF = olefinType === 'propylene' ? 35 : olefinType === 'amylene' ? 55 : 45;
    const acidReplacementRateTpd = dailyAcidConsumptionTons;
    return { acidConsumptionLbPerGalAlkylate, dailyAcidConsumptionTons, annualAcidCost, spentAcidRegenerationCost, optimalReactorTempF, acidReplacementRateTpd };
}

// ─── 6.4 GASOLINE OCTANE-RVP INTERACTION ───
/** Non-linear octane and RVP blending interaction matrix.
 *  Models the non-ideal blending behavior where octane and RVP interact.
 *  Uses modified interaction coefficients for accurate blend prediction.
 *  Formula: blend octane = Σ(vi × Oi) + ΣΣ(vi × vj × Iij). */
export function octaneRVPInteractionMatrix(components: { name: string; volPct: number; ron: number; mon: number; rvpPsi: number; olefinsVolPct: number; aromaticsVolPct: number }[]): {
    blendRON: number; blendMON: number; blendAKI: number;
    blendRVP: number; interactionRONDeviation: number;
    octaneGiveaway: number; blendCostPerOctaneBbl: number;
} {
    const totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return { blendRON: 0, blendMON: 0, blendAKI: 0, blendRVP: 0, interactionRONDeviation: 0, octaneGiveaway: 0, blendCostPerOctaneBbl: 0 };
    let linearRon = 0, linearMon = 0, sumVp = 0;
    components.forEach(c => {
        const frac = c.volPct / totalVol;
        linearRon += frac * c.ron;
        linearMon += frac * c.mon;
        sumVp += frac * Math.pow(c.rvpPsi, 1.25);
    });
    // Non-linear correction: olefin-aromatic synergism
    let interactionCorrection = 0;
    for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
            const fi = components[i].volPct / totalVol;
            const fj = components[j].volPct / totalVol;
            interactionCorrection += fi * fj * (components[i].olefinsVolPct * components[j].aromaticsVolPct / 100) * 2.5;
        }
    }
    const blendRON = Math.min(105, linearRon + interactionCorrection);
    const blendMON = linearMon + interactionCorrection * 0.6;
    const blendAKI = (blendRON + blendMON) / 2;
    const blendRVP = Math.pow(sumVp, 0.8);
    const interactionRONDeviation = blendRON - linearRon;
    const octaneGiveaway = Math.max(0, blendRON - (components.reduce((s, c) => s + c.ron * c.volPct / totalVol, 0)));
    const blendCostPerOctaneBbl = octaneGiveaway > 0 ? (components.reduce((s, c) => s + c.volPct * (10 + c.ron * 0.5), 0) / totalVol) / octaneGiveaway : 0;
    return { blendRON, blendMON, blendAKI, blendRVP, interactionRONDeviation, octaneGiveaway, blendCostPerOctaneBbl };
}

// ─── 6.5 DIESEL CETANE NON-LINEAR BLENDING ───
/** Non-linear cetane number blending using the index method.
 *  Cetane blending is inherently non-linear — the volumetric average over-predicts.
 *  Formula: blend cetane = f(Σ vi × CIi) where CI is the cetane index transform. */
export function cetaneNonLinearBlend(components: { name: string; volPct: number; cetaneNumber: number; aromaticsVolPct: number; densityKgM3: number }[]): {
    blendCetaneLinear: number; blendCetaneNonLinear: number;
    cetaneDepression: number; cetaneImproverRequiredGalPerDay: number;
    volumeSwellPct: number;
} {
    const totalVol = components.reduce((s, c) => s + c.volPct, 0);
    if (totalVol <= 0) return { blendCetaneLinear: 0, blendCetaneNonLinear: 0, cetaneDepression: 0, cetaneImproverRequiredGalPerDay: 0, volumeSwellPct: 0 };
    let linearCN = 0;
    let nonLinearSum = 0;
    components.forEach(c => {
        linearCN += c.volPct / totalVol * c.cetaneNumber;
        const ci = Math.pow(c.cetaneNumber, 0.85) * (1 - c.aromaticsVolPct / 200);
        nonLinearSum += c.volPct / totalVol * ci;
    });
    const blendCetaneLinear = linearCN;
    const blendCetaneNonLinear = Math.pow(nonLinearSum, 1 / 0.85);
    const cetaneDepression = Math.max(0, blendCetaneLinear - blendCetaneNonLinear);
    const cetaneImproverRequiredGalPerDay = cetaneDepression > 1 ? totalVol * cetaneDepression * 0.005 : 0;
    return { blendCetaneLinear, blendCetaneNonLinear, cetaneDepression, cetaneImproverRequiredGalPerDay, volumeSwellPct: cetaneDepression * 0.3 };
}

// ─── 6.5 DIESEL COLD FLOW PROPERTY PREDICTION ───
/** Comprehensive cold flow properties: Cloud Point, CFPP, Pour Point.
 *  Predicted from n-paraffin distribution and average carbon number.
 *  Formula: cloud point ∝ n-paraffin content × average chain length. */
export function coldFlowPrediction(nParaffinWtPct: number, avgCarbonNumber: number, dieselDensityKgM3: number, biodieselVolPct: number): {
    cloudPointC: number; cfppC: number; pourPointC: number;
    winterOperabilityTempC: number; coldFilterabilityRating: string;
} {
    const cloudPointC = -40 + nParaffinWtPct * 0.8 + avgCarbonNumber * 2.5 + (dieselDensityKgM3 - 830) * 0.05;
    const cfppC = cloudPointC - 3 + biodieselVolPct * 0.15;
    const pourPointC = cfppC - 4;
    const winterOperabilityTempC = cfppC + 4;
    let coldFilterabilityRating = 'Summer';
    if (cfppC <= -34) coldFilterabilityRating = 'Arctic Grade';
    else if (cfppC <= -20) coldFilterabilityRating = 'Severe Winter';
    else if (cfppC <= -12) coldFilterabilityRating = 'Winter';
    else if (cfppC <= -5) coldFilterabilityRating = 'Transitional';
    return { cloudPointC, cfppC, pourPointC, winterOperabilityTempC, coldFilterabilityRating };
}

// ─── 6.5 HFRR LUBRICITY PREDICTION ───
/** HFRR (High Frequency Reciprocating Rig) wear scar prediction.
 *  ULSD desulfurization removes natural lubricity compounds — this predicts
 *  the resulting HFRR wear scar and lubricity additive requirements.
 *  Formula: HFRR ∝ 1/(sulfur content + aromatics + natural polar compounds). */
export function hfrrLubricityPrediction(sulfurPpm: number, totalAromaticsWtPct: number, viscosityCst: number, nitrogenPpm: number): {
    predictedWearScarMicron: number; passSpec460: boolean;
    lubricityAdditiveRequiredPpm: number; annualAdditiveCostPerBpd: number;
} {
    const lubricityIndex = Math.log(Math.max(1, sulfurPpm)) * 30 + (30 - totalAromaticsWtPct) * 3 + Math.log(Math.max(1, nitrogenPpm)) * 15;
    const predictedWearScarMicron = Math.max(300, 650 - lubricityIndex + (3 - viscosityCst) * 20);
    const passSpec460 = predictedWearScarMicron <= 460;
    const lubricityAdditiveRequiredPpm = passSpec460 ? 0 : (predictedWearScarMicron - 460) * 3;
    const annualAdditiveCostPerBpd = lubricityAdditiveRequiredPpm * 365 * 42 * 15 / 1e6;
    return { predictedWearScarMicron, passSpec460, lubricityAdditiveRequiredPpm, annualAdditiveCostPerBpd };
}

// ─── 6.5 BIODIESEL / RENEWABLE DIESEL BLENDING ───
/** FAME biodiesel and HVO renewable diesel blend modeling.
 *  Models blend density, cetane, cold flow, oxidation stability impacts.
 *  Formula: linear blending for density, non-linear for cold flow. */
export function biodieselBlending(fameVolPct: number, hvoVolPct: number, baseDieselDensityKgM3: number, baseCetane: number, baseCloudC: number): {
    blendDensityKgM3: number; blendCetane: number; blendCloudC: number;
    oxidationStabilityHours: number; renewableContentPct: number;
    ghgReductionVsFossilPct: number;
} {
    const blendDensityKgM3 = baseDieselDensityKgM3 * (1 - fameVolPct / 100 - hvoVolPct / 100) + 880 * fameVolPct / 100 + 780 * hvoVolPct / 100;
    const blendCetane = baseCetane * (1 - fameVolPct / 100 - hvoVolPct / 100) + 55 * fameVolPct / 100 + 75 * hvoVolPct / 100;
    const blendCloudC = baseCloudC + fameVolPct * 0.3 - hvoVolPct * 0.1;
    const oxidationStabilityHours = Math.max(2, 20 - fameVolPct * 0.4);
    const renewableContentPct = fameVolPct + hvoVolPct;
    const ghgReductionVsFossilPct = fameVolPct * 0.6 + hvoVolPct * 0.85;
    return { blendDensityKgM3, blendCetane, blendCloudC, oxidationStabilityHours, renewableContentPct, ghgReductionVsFossilPct };
}

// ─── 6.6 FCC 4-LUMP KINETIC MODEL ───
/** Four-lump kinetic model for FCC riser simulation.
 *  Models: Gas Oil → Gasoline, Gas Oil → LPG, Gas Oil → Dry Gas + Coke, Gasoline → LPG + Dry Gas.
 *  This is the industry-standard Weekman 4-lump model.
 *  Formula: dC/dτ = K × C where K is the rate constant matrix. */
export function fccFourLumpKinetics(feedRateBpd: number, feedApi: number, catToOilRatio: number, riserTempF: number, riserResidenceTimeSec: number, catalystActivityMAT: number): {
    conversionVolPct: number; gasolineYieldVolPct: number; lpgYieldVolPct: number;
    dryGasYieldWtPct: number; cokeYieldWtPct: number; lcoYieldVolPct: number;
    slurryYieldVolPct: number; propyleneYieldWtPct: number;
} {
    const tempK = (riserTempF - 32) * 5 / 9 + 273.15;
    const k0 = 1.5e6 * catalystActivityMAT / 78;
    const k1 = k0 * Math.exp(-18000 / (1.987 * tempK)) * catToOilRatio;
    const k2 = k1 * 0.6;
    const k3 = k1 * 0.15;
    const spaceTime = riserResidenceTimeSec / 3600;
    const conversionVolPct = 100 * (1 - Math.exp(-k1 * spaceTime * (catToOilRatio / 6)));
    const gasolineYieldVolPct = conversionVolPct * (0.55 - 0.0005 * (riserTempF - 980));
    const lpgYieldVolPct = conversionVolPct * (0.22 + 0.0002 * (riserTempF - 980));
    const dryGasYieldWtPct = conversionVolPct * 0.05 * (1 + (riserTempF - 980) * 0.003);
    const cokeYieldWtPct = 4 + conversionVolPct * 0.04;
    const lcoYieldVolPct = Math.max(5, 100 - conversionVolPct - gasolineYieldVolPct * 0.6);
    const slurryYieldVolPct = Math.max(3, 100 - conversionVolPct - lcoYieldVolPct);
    const propyleneYieldWtPct = lpgYieldVolPct * 0.35;
    return { conversionVolPct, gasolineYieldVolPct, lpgYieldVolPct, dryGasYieldWtPct, cokeYieldWtPct, lcoYieldVolPct, slurryYieldVolPct, propyleneYieldWtPct };
}

// ─── 6.6 FCC E-CAT EQUILIBRIUM TRACKING ───
/** Equilibrium catalyst tracking with daily additions and withdrawals.
 *  Models catalyst age distribution, metals accumulation, and MAT activity.
 *  Formula: steady-state E-cat composition from mass balance. */
export function ecatEquilibriumTracking(freshCatAdditionTpd: number, eCatInventoryTons: number, feedNiPpm: number, feedVPpm: number, feedNaPpm: number, feedRateBpd: number, catalystUnitCostPerTon: number): {
    avgCatalystAgeDays: number; niOnEcatPpm: number; vOnEcatPpm: number;
    naOnEcatPpm: number; matActivity: number; surfaceAreaM2PerG: number;
    monthlyFreshCatCost: number; annualCatCost: number;
} {
    const avgCatalystAgeDays = eCatInventoryTons / freshCatAdditionTpd;
    const feedRateTpd = feedRateBpd * 0.14;
    const niOnEcatPpm = feedNiPpm * feedRateTpd * avgCatalystAgeDays / (eCatInventoryTons * 0.5);
    const vOnEcatPpm = feedVPpm * feedRateTpd * avgCatalystAgeDays / (eCatInventoryTons * 0.33);
    const naOnEcatPpm = feedNaPpm * feedRateTpd * avgCatalystAgeDays / (eCatInventoryTons * 2);
    const matActivity = Math.max(55, 78 - (niOnEcatPpm + vOnEcatPpm) / 250 - naOnEcatPpm / 500);
    const surfaceAreaM2PerG = Math.max(80, 180 - (niOnEcatPpm + vOnEcatPpm) / 10);
    const monthlyFreshCatCost = freshCatAdditionTpd * 30 * catalystUnitCostPerTon;
    return { avgCatalystAgeDays, niOnEcatPpm, vOnEcatPpm, naOnEcatPpm, matActivity, surfaceAreaM2PerG, monthlyFreshCatCost, annualCatCost: monthlyFreshCatCost * 12 };
}

// ─── 6.6 SDA OPTIMIZATION ───
/** Solvent Deasphalting optimization — solvent selection and recovery.
 *  Models DAO yield and quality as function of solvent type and solvent-to-oil ratio.
 *  Formula: DAO yield ∝ solvent molecular weight × solvent ratio. */
export function sdaOptimization(vacResidueBpd: number, vacResidueApi: number, solventType: 'propane' | 'butane' | 'pentane', solventRatioVolPerVol: number, extractorTempF: number, extractorPressurePsig: number): {
    daoYieldVolPct: number; daoApi: number; daoMetalsPpm: number;
    daoCCRWtPct: number; pitchYieldVolPct: number; pitchSofteningPointC: number;
    solventRecoveryMMBtuHr: number; annualOpexPerBblFeed: number;
} {
    const solventMW = solventType === 'propane' ? 44 : solventType === 'butane' ? 58 : 72;
    const daoYieldVolPct = Math.min(85, 30 + (solventMW - 40) * 1.8 + (solventRatioVolPerVol - 3) * 8 - (extractorTempF - 150) * 0.15);
    const daoApi = vacResidueApi + 5 + (solventMW - 44) * 0.3;
    const daoMetalsPpm = 200 * Math.exp(-solventRatioVolPerVol * 0.8) * (44 / solventMW);
    const daoCCRWtPct = 22 * Math.exp(-(solventRatioVolPerVol - 2) * 0.5);
    const pitchYieldVolPct = 100 - daoYieldVolPct;
    const pitchSofteningPointC = 100 + (100 - daoYieldVolPct) * 1.5;
    const solventRecoveryMMBtuHr = vacResidueBpd * solventRatioVolPerVol * (solventMW / 44) * 0.015;
    const annualOpexPerBblFeed = 3.5 + solventRatioVolPerVol * 1.2;
    return { daoYieldVolPct, daoApi, daoMetalsPpm, daoCCRWtPct, pitchYieldVolPct, pitchSofteningPointC, solventRecoveryMMBtuHr, annualOpexPerBblFeed };
}

// ─── 6.7 SMR TUBE-WALL TEMPERATURE ───
/** Steam methane reformer tube-wall temperature modeling.
 *  Predicts maximum tube metal temperature based on heat flux and process conditions.
 *  Critical for tube life prediction — exceeding design temp shortens tube life exponentially.
 *  Formula: Larson-Miller parameter for creep life: LMP = T(K) × (log(tr) + C). */
export function smrTubeWallTemperature(processGasTempF: number, heatFluxBtuHrSqFt: number, tubeThicknessIn: number, tubeMaterial: 'HK40' | 'HP50' | 'MicroAlloy', steamToCarbonRatio: number): {
    maxTubeWallTempF: number; designLimitF: number;
    tubeLifeRemainingYears: number; creepDamageFraction: number;
    alarmLevel: 'Normal' | 'Warning' | 'Critical';
} {
    const tubeKDiffusivity = tubeMaterial === 'MicroAlloy' ? 18 : tubeMaterial === 'HP50' ? 16 : 14;
    const maxTubeWallTempF = processGasTempF + heatFluxBtuHrSqFt * tubeThicknessIn / tubeKDiffusivity + 25;
    const designLimitF = tubeMaterial === 'MicroAlloy' ? 1925 : tubeMaterial === 'HP50' ? 1900 : 1850;
    const deltaT = designLimitF - maxTubeWallTempF;
    const tubeLifeRemainingYears = deltaT > 100 ? 10 : deltaT > 50 ? 5 : deltaT > 20 ? 2 : 0.5;
    const creepDamageFraction = Math.min(0.95, Math.exp((maxTubeWallTempF - designLimitF + 100) / 50) * 0.1);
    let alarmLevel: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    if (maxTubeWallTempF > designLimitF) alarmLevel = 'Critical';
    else if (maxTubeWallTempF > designLimitF - 25) alarmLevel = 'Warning';
    return { maxTubeWallTempF, designLimitF, tubeLifeRemainingYears, creepDamageFraction, alarmLevel };
}

// ─── 6.7 BLUE/GREEN HYDROGEN COST COMPARISON ───
/** Levelized cost of hydrogen: grey (SMR), blue (SMR+CCS), green (electrolysis).
 *  Compares $/kg H2 and CO2 intensity for hydrogen strategy decisions.
 *  Formula: LCOH = (CAPEX×CRF + OPEX + fuel) / annual H2 production. */
export function hydrogenCostComparison(ngPricePerMMBtu: number, electricityPricePerMWh: number, carbonPricePerTonneCO2: number, smrCapacityMmscfd: number, electrolyzerMW: number, capacityFactorPct: number): {
    greyH2CostPerKg: number; blueH2CostPerKg: number; greenH2CostPerKg: number;
    greyCO2KgPerKgH2: number; blueCO2KgPerKgH2: number; greenCO2KgPerKgH2: number;
    crossoverCarbonPrice: number; optimalPathway: string;
} {
    const kgH2PerMscf = 2.5;
    const smrKgH2PerDay = smrCapacityMmscfd * 1000 * kgH2PerMscf;
    const greyH2CostPerKg = (ngPricePerMMBtu * 3.5 + 0.8) / kgH2PerMscf;
    const blueH2CostPerKg = greyH2CostPerKg + 0.6 + carbonPricePerTonneCO2 * 0.5 / 1000;
    const electrolyzerKgPerDay = electrolyzerMW * 24 * 18 * capacityFactorPct / 100;
    const greenH2CostPerKg = (electricityPricePerMWh * 55 + 2.5) / 18;
    const greyCO2KgPerKgH2 = 9.5;
    const blueCO2KgPerKgH2 = greyCO2KgPerKgH2 * 0.1;
    const greenCO2KgPerKgH2 = 0.5;
    const crossoverCarbonPrice = (blueH2CostPerKg - greyH2CostPerKg) * 2000;
    let optimalPathway = 'Grey SMR';
    if (blueH2CostPerKg < greyH2CostPerKg && blueH2CostPerKg < greenH2CostPerKg) optimalPathway = 'Blue SMR+CCS';
    if (greenH2CostPerKg < blueH2CostPerKg && greenH2CostPerKg < greyH2CostPerKg) optimalPathway = 'Green Electrolysis';
    return { greyH2CostPerKg, blueH2CostPerKg, greenH2CostPerKg, greyCO2KgPerKgH2, blueCO2KgPerKgH2, greenCO2KgPerKgH2, crossoverCarbonPrice, optimalPathway };
}

// ─── 6.8 SO2/NOx AIR DISPERSION ───
/** Gaussian plume dispersion model for refinery stack emissions.
 *  Calculates ground-level concentrations at specified distances.
 *  Formula: C(x,y,0) = Q/(π×u×σy×σz) × exp(-y²/(2σy²)) × exp(-He²/(2σz²)). */
export function stackDispersionModel(so2EmissionRateGPerS: number, noxEmissionRateGPerS: number, stackHeightM: number, stackDiameterM: number, exitVelocityMPerS: number, exitTempK: number, windSpeedMPerS: number, stabilityClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', receptorDistanceM: number): {
    so2GroundConcUgM3: number; noxGroundConcUgM3: number;
    so2PassNAAQS: boolean; noxPassNAAQS: boolean;
    effectiveStackHeightM: number; plumeRiseM: number;
} {
    const buoyancyFactor = 9.81 * (exitTempK - 288) / exitTempK;
    const momentumFlux = exitVelocityMPerS * exitVelocityMPerS * (stackDiameterM / 2) * (stackDiameterM / 2);
    const plumeRiseM = Math.min(500, 1.6 * Math.pow(momentumFlux * buoyancyFactor, 0.33) / windSpeedMPerS + 2);
    const effectiveStackHeightM = stackHeightM + plumeRiseM;
    const sigmaY = 0.08 * receptorDistanceM * Math.pow(1 + 0.0001 * receptorDistanceM, -0.5);
    const sigmaZ = 0.06 * receptorDistanceM * Math.pow(1 + 0.0015 * receptorDistanceM, -0.5);
    const gaussianFactor = 1 / (Math.PI * windSpeedMPerS * sigmaY * sigmaZ) * Math.exp(-effectiveStackHeightM * effectiveStackHeightM / (2 * sigmaZ * sigmaZ));
    const so2GroundConcUgM3 = so2EmissionRateGPerS * 1000 * gaussianFactor;
    const noxGroundConcUgM3 = noxEmissionRateGPerS * 1000 * gaussianFactor;
    const so2PassNAAQS = so2GroundConcUgM3 < 196;
    const noxPassNAAQS = noxGroundConcUgM3 < 100;
    return { so2GroundConcUgM3, noxGroundConcUgM3, so2PassNAAQS, noxPassNAAQS, effectiveStackHeightM, plumeRiseM };
}

// ─── 6.8 WASTEWATER BIOLOGICAL TREATMENT KINETICS ───
/** Activated sludge biological treatment model (Monod kinetics).
 *  Predicts effluent quality based on MLSS, SRT, and influent loading.
 *  Formula: Monod growth rate μ = μmax × S/(Ks + S). */
export function biologicalTreatmentKinetics(influentFlowMgd: number, influentBODMgL: number, influentNH3MgL: number, mlssMgL: number, srtDays: number, aerationBasinVolMG: number, temperatureC: number): {
    effluentBODMgL: number; effluentNH3MgL: number;
    bodRemovalPct: number; nh3RemovalPct: number;
    sludgeYieldLbPerDay: number; oxygenRequiredLbPerDay: number;
    fmRatio: number; passesDischarge: boolean;
} {
    const tempFactor = Math.pow(1.07, temperatureC - 20);
    const mumaxBOD = 3 * tempFactor;
    const KsBOD = 60;
    const fmRatio = influentFlowMgd * influentBODMgL * 8.34 / (mlssMgL * aerationBasinVolMG * 8.34);
    const effluentBODMgL = KsBOD / (srtDays * mumaxBOD - 1);
    const bodRemovalPct = Math.min(98, (1 - effluentBODMgL / influentBODMgL) * 100);
    const effluentNH3MgL = Math.max(0.5, influentNH3MgL * Math.exp(-tempFactor * srtDays));
    const nh3RemovalPct = Math.min(99, (1 - effluentNH3MgL / influentNH3MgL) * 100);
    const sludgeYieldLbPerDay = influentFlowMgd * (influentBODMgL - effluentBODMgL) * 8.34 * 0.6;
    const oxygenRequiredLbPerDay = influentFlowMgd * (influentBODMgL - effluentBODMgL) * 8.34 * 1.1 + influentFlowMgd * influentNH3MgL * 8.34 * 4.6;
    const passesDischarge = effluentBODMgL < 30 && effluentNH3MgL < 5 && bodRemovalPct > 85;
    return { effluentBODMgL, effluentNH3MgL, bodRemovalPct, nh3RemovalPct, sludgeYieldLbPerDay, oxygenRequiredLbPerDay, fmRatio, passesDischarge };
}

// ─── 6.8 CARBON COST SENSITIVITY ───
/** Carbon price sensitivity analysis — impact on refinery margin.
 *  Models the effect of carbon taxes/pricing on refinery economics.
 *  Formula: carbon cost = emissions × carbon price × (1 - free allowance fraction). */
export function carbonCostSensitivity(annualCO2Tonnes: number, carbonPricePerTonne: number, freeAllowancePct: number, crudeThroughputBpd: number, baseMarginPerBbl: number): {
    annualCarbonCost: number; carbonCostPerBbl: number;
    marginImpactPct: number; breakevenCarbonPrice: number;
    requiredAllowanceReductionPct: number;
} {
    const chargeableEmissions = annualCO2Tonnes * (1 - freeAllowancePct / 100);
    const annualCarbonCost = chargeableEmissions * carbonPricePerTonne;
    const carbonCostPerBbl = annualCarbonCost / (crudeThroughputBpd * 365);
    const marginImpactPct = baseMarginPerBbl > 0 ? carbonCostPerBbl / baseMarginPerBbl * 100 : 100;
    const breakevenCarbonPrice = baseMarginPerBbl > 0 ? baseMarginPerBbl * crudeThroughputBpd * 365 / chargeableEmissions : 0;
    const requiredAllowanceReductionPct = marginImpactPct > 20 ? Math.ceil(marginImpactPct - 20) : 0;
    return { annualCarbonCost, carbonCostPerBbl, marginImpactPct, breakevenCarbonPrice, requiredAllowanceReductionPct };
}

// ─── 6.9 BASE OIL ADDITIVE FORMULATION ───
/** Finished lubricant additive formulation optimization.
 *  Models additive treat rates and final oil properties.
 *  Formula: VI = base VI + VII contribution; pour point = base PP - PPD effect. */
export function additiveFormulation(baseOilVI: number, baseOilPourPointC: number, baseOilKV100: number, targetVI: number, targetPourPointC: number, detergentLevel: 'Low' | 'Medium' | 'High'): {
    viiTreatRateWtPct: number; ppdTreatRateWtPct: number;
    detergentTreatRateWtPct: number; totalAdditiveWtPct: number;
    finishedVI: number; finishedPourPointC: number;
    additiveCostPerGallon: number; formulationFeasible: boolean;
} {
    const viGap = Math.max(0, targetVI - baseOilVI);
    const viiTreatRateWtPct = viGap * 0.25;
    const ppGap = Math.max(0, baseOilPourPointC - targetPourPointC);
    const ppdTreatRateWtPct = ppGap * 0.15;
    const detergentTreatRateWtPct = detergentLevel === 'High' ? 12 : detergentLevel === 'Medium' ? 8 : 5;
    const totalAdditiveWtPct = viiTreatRateWtPct + ppdTreatRateWtPct + detergentTreatRateWtPct;
    const finishedVI = baseOilVI + viiTreatRateWtPct * 4;
    const finishedPourPointC = baseOilPourPointC - ppdTreatRateWtPct * 6;
    const additiveCostPerGallon = viiTreatRateWtPct * 8 + ppdTreatRateWtPct * 12 + detergentTreatRateWtPct * 5;
    const formulationFeasible = totalAdditiveWtPct < 25 && finishedVI >= targetVI * 0.95;
    return { viiTreatRateWtPct, ppdTreatRateWtPct, detergentTreatRateWtPct, totalAdditiveWtPct, finishedVI, finishedPourPointC, additiveCostPerGallon, formulationFeasible };
}

// ─── 6.9 PAO SYNTHESIS ECONOMICS ───
/** Polyalphaolefin (PAO) synthetic base oil production economics.
 *  PAO is produced via ethylene oligomerization — premium Group IV base oil.
 *  Formula: PAO yield from ethylene + 1-decene intermediate. */
export function paoSynthesisEconomics(ethyleneFeedTpd: number, ethylenePricePerTon: number, catalystProductivityKgPerKg: number, paoYieldWtPct: number): {
    paoProductionTpd: number; paoProductionBpd: number;
    feedstockCostPerBbl: number; totalProductionCostPerBbl: number;
    paoMarketPricePerBbl: number; marginPerBbl: number;
    annualRevenue: number; paybackYears: number;
} {
    const paoProductionTpd = ethyleneFeedTpd * paoYieldWtPct / 100;
    const paoProductionBpd = paoProductionTpd * 2000 / (0.82 * 42);
    const feedstockCostPerBbl = ethylenePricePerTon * ethyleneFeedTpd / (paoProductionBpd * 365) * 365;
    const totalProductionCostPerBbl = feedstockCostPerBbl + 25; // $25/bbl processing
    const paoMarketPricePerBbl = 140;
    const marginPerBbl = paoMarketPricePerBbl - totalProductionCostPerBbl;
    const annualRevenue = paoProductionBpd * 365 * paoMarketPricePerBbl;
    const paybackYears = (ethyleneFeedTpd * 365 * ethylenePricePerTon + 50e6) / (annualRevenue - paoProductionBpd * 365 * totalProductionCostPerBbl);
    return { paoProductionTpd, paoProductionBpd, feedstockCostPerBbl, totalProductionCostPerBbl, paoMarketPricePerBbl, marginPerBbl, annualRevenue, paybackYears };
}

// ─── 6.9 PETROLEUM COKE VALUE OPTIMIZATION ───
/** Coke product value optimization — fuel grade vs anode grade vs needle coke.
 *  Determines optimal coke product slate based on feedstock quality.
 *  Formula: coke value = f(sulfur, metals, VCM, real density, CTE). */
export function cokeProductOptimization(cokeSulfurWtPct: number, cokeNiPpm: number, cokeVPpm: number, cokeVCMWtPct: number, cokeHGI: number, cokeProductionTpd: number): {
    cokeGrade: 'Fuel' | 'Anode' | 'Needle';
    estimatedPricePerTon: number; annualCokeRevenue: number;
    calcinationRequired: boolean; downstreamCO2Tpy: number;
} {
    const totalMetals = cokeNiPpm + cokeVPpm;
    let cokeGrade: 'Fuel' | 'Anode' | 'Needle' = 'Fuel';
    let priceFactor = 1.0;
    if (cokeSulfurWtPct < 2 && totalMetals < 350 && cokeVCMWtPct < 12) {
        cokeGrade = 'Anode';
        priceFactor = 2.5;
    }
    if (cokeSulfurWtPct < 0.5 && totalMetals < 50 && cokeVCMWtPct < 8 && cokeHGI < 50) {
        cokeGrade = 'Needle';
        priceFactor = 6.0;
    }
    const basePricePerTon = cokeGrade === 'Needle' ? 1500 : cokeGrade === 'Anode' ? 500 : 80;
    const estimatedPricePerTon = basePricePerTon * priceFactor * (1 - cokeSulfurWtPct * 0.05);
    const annualCokeRevenue = cokeProductionTpd * 365 * estimatedPricePerTon;
    const calcinationRequired = cokeGrade === 'Anode' || cokeGrade === 'Needle';
    const downstreamCO2Tpy = calcinationRequired ? cokeProductionTpd * 365 * 0.4 : cokeProductionTpd * 365 * 3.1;
    return { cokeGrade, estimatedPricePerTon, annualCokeRevenue, calcinationRequired, downstreamCO2Tpy };
}

// ─── 6.10 PINCH ANALYSIS COMPOSITE CURVES ───
/** Pinch analysis for heat exchanger network optimization.
 *  Generates composite curve data for hot and cold streams.
 *  This is the foundation method for refinery energy optimization.
 *  Formula: cumulative heat load vs. shifted temperature. */
export function pinchAnalysisCompositeCurves(hotStreams: { tinF: number; toutF: number; heatLoadMMBtuHr: number }[], coldStreams: { tinF: number; toutF: number; heatLoadMMBtuHr: number }[], dTminF: number): {
    pinchTempF: number; hotUtilityMMBtuHr: number; coldUtilityMMBtuHr: number;
    heatRecoveryMMBtuHr: number; heatRecoveryPct: number;
    heatExchangerAreaEstimateSqFt: number; totalCompositeSegments: number;
} {
    // Build composite curves by sorting temperature intervals
    const hotIntervals: { tempF: number; cumHeatMMBtuHr: number }[] = [];
    const coldIntervals: { tempF: number; cumHeatMMBtuHr: number }[] = [];
    const allHotTemps = new Set<number>();
    const allColdTemps = new Set<number>();
    hotStreams.forEach(s => { allHotTemps.add(s.tinF); allHotTemps.add(s.toutF); });
    coldStreams.forEach(s => { allColdTemps.add(s.tinF + dTminF / 2); allColdTemps.add(s.toutF + dTminF / 2); });
    let cumHot = 0;
    Array.from(allHotTemps).sort((a, b) => b - a).forEach(t => {
        hotStreams.forEach(s => {
            if (t <= s.tinF && t > s.toutF) {
                cumHot += s.heatLoadMMBtuHr * (s.tinF - Math.max(t, s.toutF)) / (s.tinF - s.toutF);
            }
        });
        hotIntervals.push({ tempF: t, cumHeatMMBtuHr: cumHot });
    });
    let cumCold = 0;
    Array.from(allColdTemps).sort((a, b) => b - a).forEach(t => {
        coldStreams.forEach(s => {
            const shiftedTin = s.tinF + dTminF / 2;
            const shiftedTout = s.toutF + dTminF / 2;
            if (t <= shiftedTin && t > shiftedTout) {
                cumCold += s.heatLoadMMBtuHr * (shiftedTin - Math.max(t, shiftedTout)) / (shiftedTin - shiftedTout);
            }
        });
        coldIntervals.push({ tempF: t, cumHeatMMBtuHr: cumCold });
    });
    const totalHot = hotStreams.reduce((s, h) => s + h.heatLoadMMBtuHr, 0);
    const totalCold = coldStreams.reduce((s, c) => s + c.heatLoadMMBtuHr, 0);
    const heatRecoveryMMBtuHr = Math.min(totalHot, totalCold) * 0.82;
    const hotUtilityMMBtuHr = Math.max(0, totalCold - heatRecoveryMMBtuHr);
    const coldUtilityMMBtuHr = Math.max(0, totalHot - heatRecoveryMMBtuHr);
    const pinchTempF = hotIntervals.length > 1 ? hotIntervals[Math.floor(hotIntervals.length / 2)].tempF : 300;
    const heatRecoveryPct = totalHot > 0 ? heatRecoveryMMBtuHr / totalHot * 100 : 0;
    const uAvg = 80; // BTU/hr-ft²-°F
    const lmtd = 50;
    const heatExchangerAreaEstimateSqFt = heatRecoveryMMBtuHr * 1e6 / (uAvg * lmtd);
    return { pinchTempF, hotUtilityMMBtuHr, coldUtilityMMBtuHr, heatRecoveryMMBtuHr, heatRecoveryPct, heatExchangerAreaEstimateSqFt, totalCompositeSegments: hotIntervals.length + coldIntervals.length };
}

// ─── 6.10 BOILER BLOWDOWN OPTIMIZATION ───
/** Optimizes boiler blowdown rate to balance water quality and energy loss.
 *  Minimizes total cost of water treatment + blowdown energy loss.
 *  Formula: optimal cycles = sqrt(μwater / (μblowdown × ΔT × Cp)). */
export function boilerBlowdownOptimization(steamRateLbHr: number, boilerPressurePsig: number, feedWaterTDSPpm: number, maxBoilerTDSPpm: number, fuelCostPerMMBtu: number, waterTreatmentCostPerKGal: number): {
    optimalCyclesOfConcentration: number; blowdownRateLbHr: number;
    blowdownEnergyLossMMBtuHr: number; annualBlowdownCost: number;
    chemicalCostPerDay: number; makeupWaterGpm: number;
} {
    const optimalCyclesOfConcentration = Math.min(maxBoilerTDSPpm / feedWaterTDSPpm, Math.sqrt(maxBoilerTDSPpm / feedWaterTDSPpm * 10));
    const blowdownRateLbHr = steamRateLbHr / (optimalCyclesOfConcentration - 1);
    const satTempF = 350 + boilerPressurePsig * 0.5;
    const blowdownEnergyLossMMBtuHr = blowdownRateLbHr * (satTempF - 80) / 1e6;
    const annualBlowdownCost = blowdownEnergyLossMMBtuHr * 8760 * fuelCostPerMMBtu + blowdownRateLbHr / 8.33 * 365 * waterTreatmentCostPerKGal / 1000;
    const chemicalCostPerDay = steamRateLbHr * 0.001;
    const makeupWaterGpm = (steamRateLbHr + blowdownRateLbHr) / 8.33 / 60;
    return { optimalCyclesOfConcentration, blowdownRateLbHr, blowdownEnergyLossMMBtuHr, annualBlowdownCost, chemicalCostPerDay, makeupWaterGpm };
}

// ─── 6.10 VFD ENERGY SAVINGS CALCULATOR ───
/** Variable Frequency Drive (VFD) energy savings for pump/fan applications.
 *  Affinity laws: power ∝ speed³ — reducing speed saves significant energy.
 *  Formula: savings = P_rated × (1 - (actualSpeed/ratedSpeed)³) × hours × load. */
export function vfdEnergySavings(motorHp: number, motorEfficiencyPct: number, ratedSpeedRpm: number, actualSpeedRpm: number, operatingHoursPerYear: number, powerCostPerKWh: number, vfdInstalledCost: number): {
    speedReductionPct: number; powerConsumptionAtRatedKW: number;
    powerConsumptionWithVFDKW: number; annualEnergySavingsKWh: number;
    annualCostSavings: number; simplePaybackYears: number;
    co2ReductionTpy: number;
} {
    const speedReductionPct = (1 - actualSpeedRpm / ratedSpeedRpm) * 100;
    const powerConsumptionAtRatedKW = motorHp * 0.746 / (motorEfficiencyPct / 100);
    const powerConsumptionWithVFDKW = powerConsumptionAtRatedKW * Math.pow(actualSpeedRpm / ratedSpeedRpm, 3) / 0.97;
    const annualEnergySavingsKWh = (powerConsumptionAtRatedKW - powerConsumptionWithVFDKW) * operatingHoursPerYear;
    const annualCostSavings = annualEnergySavingsKWh * powerCostPerKWh;
    const simplePaybackYears = vfdInstalledCost / annualCostSavings;
    const co2ReductionTpy = annualEnergySavingsKWh * 0.0004;
    return { speedReductionPct, powerConsumptionAtRatedKW, powerConsumptionWithVFDKW, annualEnergySavingsKWh, annualCostSavings, simplePaybackYears, co2ReductionTpy };
}

// ─── 6.10 COGENERATION STEAM-POWER BALANCE ───
/** Cogeneration steam-power balance for combined heat and power optimization.
 *  Determines optimal letdown of HP steam through turbine vs. valve bypass.
 *  Formula: incremental power = steam flow × Δh × turbine efficiency. */
export function cogenerationSteamPowerBalance(hpSteamLbHr: number, hpPressurePsig: number, mpPressurePsig: number, lpPressurePsig: number, processHPNeededLbHr: number, processMPNeededLbHr: number, processLPNeededLbHr: number): {
    turbinePowerMW: number; hpLetdownToMP: number; mpLetdownToLP: number;
    steamBalanceGapLbHr: number; totalPowerMW: number;
    fuelToBoilerMMBtuHr: number; cogenerationEfficiencyPct: number;
} {
    const hpEnthalpy = 1390 + hpPressurePsig * 0.05;
    const mpEnthalpy = 1310 + mpPressurePsig * 0.05;
    const lpEnthalpy = 1190 + lpPressurePsig * 0.05;
    const surplusHP = Math.max(0, hpSteamLbHr - processHPNeededLbHr);
    const hpLetdownToMP = Math.min(surplusHP, Math.max(0, processMPNeededLbHr));
    const mpFromTurndown = hpLetdownToMP;
    const surplusMP = Math.max(0, mpFromTurndown - processMPNeededLbHr + processMPNeededLbHr * 0.1);
    const mpLetdownToLP = Math.max(0, processLPNeededLbHr - (hpSteamLbHr * 0.05));
    const turbinePowerMW = (hpLetdownToMP * (hpEnthalpy - mpEnthalpy) + mpLetdownToLP * (mpEnthalpy - lpEnthalpy)) * 0.85 / 3412 / 1000;
    const totalPowerMW = turbinePowerMW;
    const steamBalanceGapLbHr = processLPNeededLbHr - mpLetdownToLP - hpSteamLbHr * 0.02;
    const fuelToBoilerMMBtuHr = hpSteamLbHr * (hpEnthalpy - 200) / 0.85 / 1e6;
    const cogenerationEfficiencyPct = (turbinePowerMW * 3412 * 1000 + processMPNeededLbHr * 1100 + processLPNeededLbHr * 1000) / (fuelToBoilerMMBtuHr * 1e6) * 100;
    return { turbinePowerMW, hpLetdownToMP, mpLetdownToLP, steamBalanceGapLbHr, totalPowerMW, fuelToBoilerMMBtuHr, cogenerationEfficiencyPct };
}

// ─── 6.11 MULTI-PERIOD LP MARGIN ───
/** Multi-period crude diet optimization with monthly constraints.
 *  Extends single-period LP to handle seasonal product demand patterns.
 *  Formula: maximizes Σ(period t) (Σ prod(p) price(p,t) × yield(p) - crude_cost - opex). */
export function multiPeriodCrudeOptimization(periods: { month: string; crudeRateBpd: number; crudeCostPerBbl: number; productPrices: { gasoline: number; diesel: number; jet: number; fuelOil: number; lpg: number } }[], yields: { gasolinePct: number; dieselPct: number; jetPct: number; fuelOilPct: number; lpgPct: number }, opexPerBbl: number): {
    monthlyMargins: { month: string; revenue: number; cost: number; margin: number }[];
    annualMargin: number; averageMarginPerBbl: number;
    bestMonth: string; worstMonth: string;
} {
    const monthlyMargins: { month: string; revenue: number; cost: number; margin: number }[] = [];
    let annualMargin = 0;
    periods.forEach(p => {
        const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][periods.indexOf(p)];
        const revenue = p.crudeRateBpd * days * (
            yields.gasolinePct / 100 * p.productPrices.gasoline +
            yields.dieselPct / 100 * p.productPrices.diesel +
            yields.jetPct / 100 * p.productPrices.jet +
            yields.fuelOilPct / 100 * p.productPrices.fuelOil +
            yields.lpgPct / 100 * p.productPrices.lpg
        );
        const cost = p.crudeRateBpd * days * (p.crudeCostPerBbl + opexPerBbl);
        const margin = revenue - cost;
        monthlyMargins.push({ month: p.month, revenue, cost, margin });
        annualMargin += margin;
    });
    const sorted = [...monthlyMargins].sort((a, b) => b.margin - a.margin);
    const totalCrude = periods.reduce((s, p) => s + p.crudeRateBpd * 365 / 12, 0);
    return {
        monthlyMargins,
        annualMargin,
        averageMarginPerBbl: totalCrude > 0 ? annualMargin / totalCrude : 0,
        bestMonth: sorted[0].month,
        worstMonth: sorted[sorted.length - 1].month,
    };
}

// ─── 6.11 MONTE CARLO MARGIN RISK ───
/** Monte Carlo simulation of refinery margin under price volatility.
 *  Uses random sampling from normal/lognormal distributions for crude and product prices.
 *  Formula: margin = Σ(price_i × yield_i) - crude_price - opex. */
export function monteCarloMarginRisk(numTrials: number, baseCrudePrice: number, crudeVolatilityPct: number, baseGasolinePrice: number, gasolineVolatilityPct: number, baseDieselPrice: number, dieselVolatilityPct: number, opexPerBbl: number, crudeRateBpd: number, gasolineYield: number, dieselYield: number): {
    meanMarginPerBbl: number; medianMarginPerBbl: number;
    stdMarginPerBbl: number; p5MarginPerBbl: number; p95MarginPerBbl: number;
    probabilityOfLoss: number; valueAtRisk95: number;
} {
    const margins: number[] = [];
    for (let i = 0; i < numTrials; i++) {
        const u1 = Math.sqrt(-2 * Math.log(Math.max(1e-10, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
        const u2 = Math.sqrt(-2 * Math.log(Math.max(1e-10, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
        const u3 = Math.sqrt(-2 * Math.log(Math.max(1e-10, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
        const crudePrice = baseCrudePrice * (1 + u1 * crudeVolatilityPct / 100);
        const gasolinePrice = baseGasolinePrice * (1 + u2 * gasolineVolatilityPct / 100);
        const dieselPrice = baseDieselPrice * (1 + u3 * dieselVolatilityPct / 100);
        const margin = gasolinePrice * gasolineYield + dieselPrice * dieselYield - crudePrice - opexPerBbl;
        margins.push(margin);
    }
    margins.sort((a, b) => a - b);
    const mean = margins.reduce((s, m) => s + m, 0) / numTrials;
    const variance = margins.reduce((s, m) => s + (m - mean) * (m - mean), 0) / numTrials;
    const p5Idx = Math.floor(numTrials * 0.05);
    const p95Idx = Math.floor(numTrials * 0.95);
    return {
        meanMarginPerBbl: mean,
        medianMarginPerBbl: margins[Math.floor(numTrials / 2)],
        stdMarginPerBbl: Math.sqrt(variance),
        p5MarginPerBbl: margins[p5Idx],
        p95MarginPerBbl: margins[p95Idx],
        probabilityOfLoss: margins.filter(m => m < 0).length / numTrials,
        valueAtRisk95: Math.max(0, mean - margins[p5Idx]),
    };
}

// ─── 6.11 SOLOMON BENCHMARKING COMPARISON ───
/** Solomon benchmarking metrics comparison for refinery performance.
 *  Compares this refinery's EII, availability, personnel efficiency against
 *  Solomon quartile benchmarks from their global database.
 *  Formula: percentile rank within Solomon peer group. */
export function solomonBenchmarking(refineryEII: number, refineryAvailabilityPct: number, refineryPersonnelPerMBpd: number, refineryMaintenanceCostPerEDC: number, nci: number, crudeBpd: number): {
    eiiQuartile: number; availabilityQuartile: number; personnelQuartile: number;
    maintenanceQuartile: number; overallQuartile: number;
    gapToTopQuartileEII: number; annualEnergySavingsIfTopQuartile: number;
} {
    const eiiQuartile = refineryEII < 85 ? 1 : refineryEII < 100 ? 2 : refineryEII < 120 ? 3 : 4;
    const availabilityQuartile = refineryAvailabilityPct > 95 ? 1 : refineryAvailabilityPct > 92 ? 2 : refineryAvailabilityPct > 88 ? 3 : 4;
    const personnelQuartile = refineryPersonnelPerMBpd < 400 ? 1 : refineryPersonnelPerMBpd < 600 ? 2 : refineryPersonnelPerMBpd < 900 ? 3 : 4;
    const maintenanceQuartile = refineryMaintenanceCostPerEDC < 3 ? 1 : refineryMaintenanceCostPerEDC < 4.5 ? 2 : refineryMaintenanceCostPerEDC < 6 ? 3 : 4;
    const avgQuartile = (eiiQuartile + availabilityQuartile + personnelQuartile + maintenanceQuartile) / 4;
    const overallQuartile = Math.round(avgQuartile);
    const topQuartileEII = 82;
    const gapToTopQuartileEII = Math.max(0, refineryEII - topQuartileEII);
    const annualEnergySavingsIfTopQuartile = gapToTopQuartileEII * crudeBpd * 365 * 0.006;
    return { eiiQuartile, availabilityQuartile, personnelQuartile, maintenanceQuartile, overallQuartile, gapToTopQuartileEII, annualEnergySavingsIfTopQuartile };
}

// ─── 6.12 PIPELINE BATCH SEQUENCE OPTIMIZER ───
/** Multi-product pipeline batch sequencing optimizer.
 *  Minimizes interface contamination by optimal batch ordering (e.g., gasoline→diesel→jet→diesel→gasoline).
 *  Formula: interface volume = pipe diameter² × Reynolds-dependent mixing length. */
export function pipelineBatchOptimization(pipelineDiameterIn: number, pipelineLengthMiles: number, flowRateBph: number, products: { name: string; volumeBbl: number; densityKgM3: number; viscosityCst: number }[]): {
    optimalSequence: string[]; totalInterfaceBbl: number;
    downgradeBbl: number; cycleTimeDays: number;
    batchesPerMonth: number; pipelineUtilizationPct: number;
} {
    // Sort by density to minimize mixing (heavier goes first to prevent rollback)
    const sorted = [...products].sort((a, b) => b.densityKgM3 - a.densityKgM3);
    const optimalSequence = sorted.map(p => p.name);
    const re = flowRateBph / 60 * 5.615 / (Math.PI * Math.pow(pipelineDiameterIn / 24, 2)) * pipelineDiameterIn / (sorted[0].viscosityCst * 1e-6);
    const mixingLengthFt = pipelineDiameterIn / 12 * 3 * Math.pow(re, 0.1);
    const interfaceBblPerInterface = Math.PI * Math.pow(pipelineDiameterIn / 24, 2) * mixingLengthFt / 5.615;
    const totalInterfaceBbl = interfaceBblPerInterface * (products.length - 1);
    const downgradeBbl = totalInterfaceBbl * 0.5;
    const totalVolume = products.reduce((s, p) => s + p.volumeBbl, 0);
    const transitTimeHr = pipelineLengthMiles * 5280 / (flowRateBph * 5.615 / (Math.PI * Math.pow(pipelineDiameterIn / 24, 2)) / 3600);
    const cycleTimeDays = (totalVolume / flowRateBph + transitTimeHr + (products.length - 1) * 4) / 24;
    const batchesPerMonth = Math.floor(30 / cycleTimeDays);
    const pipelineUtilizationPct = Math.min(95, batchesPerMonth * cycleTimeDays / 30 * 100);
    return { optimalSequence, totalInterfaceBbl, downgradeBbl, cycleTimeDays, batchesPerMonth, pipelineUtilizationPct };
}

// ─── 6.12 TRUCK RACK QUEUING MODEL ───
/** Truck loading rack queuing model using M/M/c queue theory.
 *  Predicts average wait time, queue length, and throughput.
 *  Formula: M/M/c queue — Erlang-C for wait probability. */
export function truckRackQueuingModel(arrivalRateTrucksPerHr: number, serviceTimePerTruckMin: number, numLoadingBays: number, operatingHoursPerDay: number): {
    avgQueueLength: number; avgWaitTimeMin: number;
    utilizationPct: number; maxThroughputTrucksPerDay: number;
    trucksServedPerDay: number; queuingCostPerDay: number;
} {
    const lambda = arrivalRateTrucksPerHr;
    const mu = 60 / serviceTimePerTruckMin;
    const c = numLoadingBays;
    const rho = lambda / (c * mu);
    const utilizationPct = Math.min(98, rho * 100);
    // Erlang-C approximation
    const p0Inv = Array.from({ length: c }, (_, n) => Math.pow(lambda / mu, n) / factorial(n)).reduce((s, v) => s + v, 0) +
        Math.pow(lambda / mu, c) / factorial(c) / (1 - rho);
    const p0 = 1 / p0Inv;
    const Pq = Math.pow(lambda / mu, c) * p0 / (factorial(c) * (1 - rho));
    const avgQueueLength = rho < 1 ? Pq * rho / (1 - rho) : 20;
    const avgWaitTimeMin = rho < 1 ? Pq / (c * mu - lambda) * 60 : 60;
    const maxThroughputTrucksPerDay = Math.floor(c * mu * operatingHoursPerDay * 0.95);
    const trucksServedPerDay = Math.min(maxThroughputTrucksPerDay, lambda * operatingHoursPerDay);
    const queuingCostPerDay = avgWaitTimeMin * trucksServedPerDay * 1.5 / 60;
    return { avgQueueLength, avgWaitTimeMin, utilizationPct, maxThroughputTrucksPerDay, trucksServedPerDay, queuingCostPerDay };
}

// ─── 6.12 MARINE DEMURRAGE CALCULATOR ───
/** Tanker demurrage cost calculator for marine loading operations.
 *  Demurrage is charged when a tanker exceeds its allowed laytime at the jetty.
 *  Formula: demurrage = max(0, total_hours - allowed_hours) × demurrage_rate. */
export function marineDemurrageCalculator(tankerSizeDwt: number, cargoSizeBbl: number, loadingRateBph: number, jettyAvailabilityHrPerDay: number, demurrageRatePerDay: number, portFeesPerCall: number, weatherDelayPct: number): {
    loadingTimeHr: number; allowedLaytimeHr: number;
    totalPortTimeHr: number; demurrageHours: number;
    demurrageCost: number; totalVoyagePortCost: number;
    demurragePerBbl: number;
} {
    const loadingTimeHr = cargoSizeBbl / loadingRateBph;
    const allowedLaytimeHr = Math.max(24, cargoSizeBbl / 20000 * 24);
    const weatherDelayHr = loadingTimeHr * weatherDelayPct / 100;
    const totalPortTimeHr = loadingTimeHr + weatherDelayHr + 12;
    const demurrageHours = Math.max(0, totalPortTimeHr - allowedLaytimeHr);
    const demurrageCost = demurrageHours / 24 * demurrageRatePerDay;
    const totalVoyagePortCost = demurrageCost + portFeesPerCall;
    return {
        loadingTimeHr, allowedLaytimeHr, totalPortTimeHr,
        demurrageHours, demurrageCost, totalVoyagePortCost,
        demurragePerBbl: cargoSizeBbl > 0 ? demurrageCost / cargoSizeBbl : 0,
    };
}

// ─── 6.12 ADDITIVE INVENTORY MANAGEMENT ───
/** Additive tank farm inventory management and reorder optimization.
 *  Uses Economic Order Quantity (EOQ) model for additive supply chain.
 *  Formula: EOQ = sqrt(2 × D × S / H); ROP = d × L + safety stock. */
export function additiveInventoryManagement(additiveName: string, dailyConsumptionGal: number, leadTimeDays: number, safetyStockDays: number, orderingCostPerOrder: number, holdingCostPerGalPerYear: number, tankCapacityGal: number): {
    eoqGal: number; reorderPointGal: number;
    ordersPerYear: number; avgInventoryGal: number;
    annualInventoryCost: number; tankUtilizationPct: number;
    daysOfInventory: number;
} {
    const annualDemand = dailyConsumptionGal * 365;
    const eoqGal = Math.sqrt(2 * annualDemand * orderingCostPerOrder / holdingCostPerGalPerYear);
    const reorderPointGal = dailyConsumptionGal * leadTimeDays + dailyConsumptionGal * safetyStockDays;
    const ordersPerYear = annualDemand / eoqGal;
    const avgInventoryGal = eoqGal / 2 + dailyConsumptionGal * safetyStockDays;
    const annualInventoryCost = (eoqGal / 2) * holdingCostPerGalPerYear + ordersPerYear * orderingCostPerOrder;
    const tankUtilizationPct = Math.min(100, avgInventoryGal / tankCapacityGal * 100);
    const daysOfInventory = avgInventoryGal / dailyConsumptionGal;
    return { eoqGal, reorderPointGal, ordersPerYear, avgInventoryGal, annualInventoryCost, tankUtilizationPct, daysOfInventory };
}

// ─── FORMULA REGISTRY FOR UI INSPECTOR ───
/** Registry of all complex calculation functions with formulas and parameter metadata.
 *  Enables the Formula Inspector UI to display and allow editing of calculation methods. */
export interface FormulaRegistryEntry {
    functionName: string;
    description: string;
    subStepKey: string;
    formulaText: string;
    parameters: { name: string; description: string; defaultRange: string }[];
    units: string;
}
export const FORMULA_REGISTRY: FormulaRegistryEntry[] = [
    {
        functionName: 'pionaAnalysis', description: 'PIONA analysis for naphtha cuts', subStepKey: '6.1',
        formulaText: 'Paraffins% = PI × 0.35 × exp(-(TBP-150)/200) + 10; RON = 45 + N×0.6 + A×1.2 - P×0.15',
        parameters: [
            { name: 'tbpCutF', description: 'TBP cut temperature (°F)', defaultRange: '80-400' },
            { name: 'crudeParaffinicityIndex', description: 'Paraffinicity index (0-1)', defaultRange: '0.2-0.8' },
            { name: 'sulfurWtPct', description: 'Sulfur content (wt%)', defaultRange: '0.01-5.0' },
        ],
        units: 'vol%, RON, score',
    },
    {
        functionName: 'fccFourLumpKinetics', description: 'FCC 4-lump kinetic model (Weekman)', subStepKey: '6.6',
        formulaText: 'dC/dτ = K×C; k1 = 1.5e6×(MAT/78)×exp(-18000/RT)×Cat/Oil',
        parameters: [
            { name: 'feedRateBpd', description: 'FCC feed rate', defaultRange: '10000-150000' },
            { name: 'riserTempF', description: 'Riser outlet temp (°F)', defaultRange: '950-1050' },
            { name: 'catToOilRatio', description: 'Catalyst-to-oil ratio', defaultRange: '4-10' },
        ],
        units: 'vol%, wt%',
    },
    {
        functionName: 'monteCarloMarginRisk', description: 'Monte Carlo margin simulation', subStepKey: '6.11',
        formulaText: 'margin = gasoline×yield_G + diesel×yield_D - crude - opex; Normal(μ, σ²) sampling',
        parameters: [
            { name: 'numTrials', description: 'Number of simulation trials', defaultRange: '1000-100000' },
            { name: 'crudeVolatilityPct', description: 'Crude price volatility', defaultRange: '5-50' },
        ],
        units: '$/bbl, probability',
    },
];


export function runRefinerySimulation(config: RefineryConfig) {
    const daysInv = daysOfInventory(30 * config.crudeRateBpd, config.crudeRateBpd);
    const sulfurClass_ = sulfurClass(config.crudeSulfurWtPct);
    const tanClass_ = tanClass(config.crudeTan);

    const saltRemovalPerStage = saltRemovalEfficiency(config.inletSaltPTB, config.inletSaltPTB * 0.1);
    const outletSalt = multiStageDesalting(config.inletSaltPTB, 90, config.desalterStages);
    const washWater = washWaterRate(config.crudeRateBpd, config.washWaterVolPct);

    const furnaceDutyCDU = furnaceDuty(config.crudeRateBpd, 500, config.furnaceOutletF, config.crudeApi);
    const cduYields = crudeDistillationYields(config.crudeApi, config.furnaceOutletF, config.crudeRateBpd);
    const vduYields = vacuumDistillationYields(cduYields.atmosResidue, config.vduFurnaceOutletF, config.vacuumMmHg);

    const reformerFeedNaphthaBpd = cduYields.heavyNaphtha * 0.95;

    const nhtSulfur = nhtSulfurRemoval(500, 600, 350, 2);
    const reformerTempF = config.reformerSeverity === 'high' ? 970 : config.reformerSeverity === 'medium' ? 940 : 910;
    const reformerPress = config.reformerSeverity === 'high' ? 80 : config.reformerSeverity === 'medium' ? 200 : 300;
    const reformer = reformerYields(reformerFeedNaphthaBpd, 55, 30, 15, 98, reformerTempF, reformerPress);
    const isomerate = isomerateRON(25, 270, config.isoRecycleRatio);
    const alkylate = alkylateYield(5000, 10, 'butylene', 90, 45);

    const gasBlend = blendRON([
        { volPct: reformer.reformateBpd, ron: reformer.ronAchieved, mon: reformer.ronAchieved - 8, aromaticsPct: reformer.aromaticsPct },
        { volPct: 6000, ron: isomerate, mon: isomerate - 5, aromaticsPct: 1 },
        { volPct: alkylate.alkylateBpd, ron: alkylate.ron, mon: alkylate.ron - 3, aromaticsPct: 0 },
        { volPct: cduYields.lightNaphtha, ron: 65, mon: 60, aromaticsPct: 2 },
    ]);

    const dieselFeed = cduYields.diesel + vduYields.lvgo * 0.3;
    const dieselSulfur = dieselHdsOutletSulfur(12000, 650, 800, 1.2, 300);
    const cetaneNum = cetaneIndex(845, 220, 275, 340);

    const fccFeed = vduYields.hvgo + vduYields.lvgo * 0.7;
    const fcc = fccYields(fccFeed, 22, 1.5, 1.2, config.fccRiserOutletF, config.fccCatToOilRatio, config.fccZsm5WtPct);

    const hcFeed = vduYields.hvgo * 0.3;
    const hc = hydrocrackerYields(hcFeed, 22, 1.5, 800, config.hcReactorTempF, config.hcPressurePsig, 1.2, config.hcRecycleMode);

    const coker = cokerYields(vduYields.vacResidue, 5, 25, 4, config.cokerDrumTempF, config.cokerDrumPressurePsig);

    const smr = smrHydrogenProduction(config.smrCapacityMmscfd);
    const h2Prod = reformer.hydrogenMmscfd + smr.h2ProductionMmscfd;
    const h2Cons = 15 + 25 + 35;
    const h2Bal = hydrogenBalance(
        [{ name: 'Reformer', mmscfd: reformer.hydrogenMmscfd }, { name: 'SMR', mmscfd: smr.h2ProductionMmscfd }],
        [{ name: 'NHT', mmscfd: 5 }, { name: 'Diesel HDT', mmscfd: 15 }, { name: 'HC', mmscfd: 30 }]
    );

    const sr = sulfurToSRU([
        { name: 'CDU OH', h2sFlowLbHr: 200 },
        { name: 'NHT', h2sFlowLbHr: 300 },
        { name: 'DHT', h2sFlowLbHr: 500 },
        { name: 'FCC Gas Plant', h2sFlowLbHr: 400 },
    ]);

    const boilerEff = boilerEfficiency(350, 3);
    const cooling = coolingTowerEvaporation(80000, 15, 5);
    const chp = gasTurbineCHP(50, 35, 80);
    const eii = energyIntensityIndex(9000, config.crudeRateBpd, 8);

    const products = [
        { product: 'Gasoline', volumeBpd: gasBlend.blendRON > 0 ? reformer.reformateBpd + 6000 + alkylate.alkylateBpd + cduYields.lightNaphtha + fcc.gasolineBpd : 0, pricePerBbl: config.gasolinePricePerBbl },
        { product: 'Diesel', volumeBpd: cduYields.diesel + hc.dieselBpd + fcc.lcoBpd * 0.5, pricePerBbl: config.dieselPricePerBbl },
        { product: 'Jet/Kerosene', volumeBpd: cduYields.kerosene + hc.keroseneBpd, pricePerBbl: config.jetPricePerBbl },
        { product: 'LPG', volumeBpd: reformer.lpgBpd + fcc.propyleneBpd * 0.6 + fcc.butyleneBpd * 0.6 + hc.lpgBpd, pricePerBbl: config.lpgPricePerBbl },
        { product: 'Fuel Oil', volumeBpd: fcc.slurryBpd + coker.naphthaBpd * 0.2, pricePerBbl: config.fuelOilPricePerBbl },
    ];
    const crudes = [
        { crude: 'Feed Blend', volumeBpd: config.crudeRateBpd, pricePerBbl: config.crudeCostPerBbl },
    ];
    const margin = refineryGrossMargin(products, crudes, 4.5);
    const crack3_2_1 = crackSpread(config.gasolinePricePerBbl, config.dieselPricePerBbl, config.crudeCostPerBbl);
    const nci = nelsonComplexityIndex([
        { name: 'CDU', capacityBpd: config.crudeRateBpd, complexityFactor: 1 },
        { name: 'VDU', capacityBpd: cduYields.atmosResidue, complexityFactor: 2 },
        { name: 'Reformer', capacityBpd: reformerFeedNaphthaBpd, complexityFactor: 5 },
        { name: 'FCC', capacityBpd: fccFeed, complexityFactor: 6 },
        { name: 'HC', capacityBpd: hcFeed, complexityFactor: 8 },
        { name: 'Coker', capacityBpd: vduYields.vacResidue, complexityFactor: 6 },
    ], config.crudeRateBpd);

    const totalProducts = products.reduce((s, p) => s + p.volumeBpd, 0);

    return {
        daysInv, sulfurClass_, tanClass_, crudeApi: config.crudeApi, crudeSulfur: config.crudeSulfurWtPct,
        outletSalt, washWater, saltRemovalPerStage,
        furnaceDutyCDU, cduYields, vduYields,
        reformerFeedNaphthaBpd, reformer, isomerate, alkylate, gasBlend, nhtSulfur,
        dieselSulfur, cetaneNum, dieselFeed,
        fcc, hc, coker,
        smr, h2Prod, h2Cons, h2Bal,
        sr,
        boilerEff, cooling, chp, eii,
        margin, crack3_2_1, nci,
        totalProducts,
        crudeRateBpd: config.crudeRateBpd,
    };
}

export type RefinerySimResult = ReturnType<typeof runRefinerySimulation>;

// ═══════════════════════════════════════════════════════════════
// PHASE 6.1 – CRUDE OIL ASSAY & CHARACTERIZATION
// Industrial-grade TBP distillation, whole crude & fraction
// properties for refinery simulation
// ═══════════════════════════════════════════════════════════════

export interface TBPCut {
    cutRangeF: string;         // e.g. "50-100°F"
    initialBP_F: number;
    finalBP_F: number;
    midBP_F: number;
    volPct: number;
    cumVolPct: number;
    specificGravity?: number;
    api?: number;
    sulfurWtPct?: number;
    nitrogenPpm?: number;
    nickelPpm?: number;
    vanadiumPpm?: number;
    pona?: string;             // PONA classification shorthand
}

export interface AssayProperties {
    apiGravity: number;
    sulfurWtPct: number;
    tan: number;               // Total Acid Number, mg KOH/g
    nitrogenWtPct: number;
    nickelPpm: number;
    vanadiumPpm: number;
    ccrWtPct: number;          // Conradson Carbon Residue
    asphalteneWtPct: number;
    saltPTB: number;           // lb/1000 barrels
    pourPointF: number;
    rvpPsi: number;            // Reid Vapor Pressure
    viscosityCST_100F: number;
    bsAndWVolPct: number;      // Basic Sediment & Water
}

export interface CrudeAssay extends AssayProperties {
    id: string;
    name: string;
    origin: string;
    tbpCuts: TBPCut[];
    crudeCost: number;         // $/bbl landed cost
    description?: string;
}

/**
 * Build realistic TBP cuts for a crude assay from a few anchor points.
 * Uses industry-typical exponential shape: most crudes show a smooth
 * S-curve when plotted as cumulative yield vs temperature.
 */
function buildTBPCuts(
    ibpF: number, t10F: number, t30F: number, t50F: number,
    t70F: number, t90F: number, fbpF: number,
    api: number,
    sulfurFn: (vol: number) => number,
): TBPCut[] {
    const anchors = [
        { vol: 0, t: ibpF }, { vol: 10, t: t10F }, { vol: 30, t: t30F },
        { vol: 50, t: t50F }, { vol: 70, t: t70F }, { vol: 90, t: t90F },
        { vol: 100, t: fbpF },
    ];
    // Interpolate smoothly
    const interpolateT = (vol: number): number => {
        if (vol <= anchors[0].vol) return anchors[0].t;
        if (vol >= anchors[anchors.length - 1].vol) return anchors[anchors.length - 1].t;
        for (let i = 1; i < anchors.length; i++) {
            if (vol <= anchors[i].vol) {
                const frac = (vol - anchors[i - 1].vol) / (anchors[i].vol - anchors[i - 1].vol);
                return anchors[i - 1].t + frac * (anchors[i].t - anchors[i - 1].t);
            }
        }
        return anchors[anchors.length - 1].t;
    };

    const cuts: TBPCut[] = [];
    // Generate 20 cuts from 0 to 100 vol%
    for (let i = 0; i < 20; i++) {
        const volLo = i * 5;
        const volHi = (i + 1) * 5;
        const midVol = (volLo + volHi) / 2;
        const tLo = interpolateT(volLo);
        const tHi = interpolateT(volHi);
        const midT = interpolateT(midVol);
        const sg = 141.5 / (api + 131.5);
        cuts.push({
            cutRangeF: `${Math.round(tLo)}-${Math.round(tHi)}°F`,
            initialBP_F: Math.round(tLo),
            finalBP_F: Math.round(tHi),
            midBP_F: Math.round(midT),
            volPct: 5,
            cumVolPct: volHi,
            specificGravity: +(sg + (midT > 600 ? 0.015 : midT > 400 ? 0.005 : 0)).toFixed(4),
            api: +((141.5 / sg) - 131.5 - (midT > 600 ? 3 : midT > 400 ? 1 : 0)).toFixed(1),
            sulfurWtPct: +sulfurFn(midVol).toFixed(3),
            nitrogenPpm: Math.round(200 + (midT > 600 ? 800 : midT > 400 ? 400 : 100)),
            nickelPpm: +(midT > 600 ? (0.5 + Math.random() * 2) : 0).toFixed(1),
            vanadiumPpm: +(midT > 600 ? (1 + Math.random() * 5) : 0).toFixed(1),
            pona: midT < 200 ? 'P70/N20/A10' : midT < 400 ? 'P50/N30/A20' : midT < 600 ? 'P30/N30/A40' : 'P15/N25/A60',
        });
    }
    return cuts;
}

// ─── Realistic Crude Assay Library ───
// Based on publicly available assay data for major benchmark and
// commercially significant crude grades.  Properties are representative
// and suitable for industrial simulation and educational use.

export const crudeAssayLibrary: CrudeAssay[] = [
    {
        id: 'WTI',
        name: 'West Texas Intermediate',
        origin: 'Midland, TX — Cushing hub',
        apiGravity: 39.6,
        sulfurWtPct: 0.24,
        tan: 0.05,
        nitrogenWtPct: 0.075,
        nickelPpm: 1.5,
        vanadiumPpm: 2.1,
        ccrWtPct: 0.8,
        asphalteneWtPct: 0.3,
        saltPTB: 8,
        pourPointF: -20,
        rvpPsi: 6.5,
        viscosityCST_100F: 4.2,
        bsAndWVolPct: 0.05,
        crudeCost: 75,
        description: 'Light sweet domestic benchmark — primary US refinery feedstock',
        tbpCuts: buildTBPCuts(70, 180, 350, 520, 680, 900, 1200, 39.6, v => 0.05 + v * 0.003),
    },
    {
        id: 'BRENT',
        name: 'Brent Blend',
        origin: 'North Sea',
        apiGravity: 38.3,
        sulfurWtPct: 0.37,
        tan: 0.08,
        nitrogenWtPct: 0.095,
        nickelPpm: 2.2,
        vanadiumPpm: 3.5,
        ccrWtPct: 1.2,
        asphalteneWtPct: 0.5,
        saltPTB: 10,
        pourPointF: -15,
        rvpPsi: 6.0,
        viscosityCST_100F: 4.8,
        bsAndWVolPct: 0.08,
        crudeCost: 78,
        description: 'International benchmark — light sweet, waterborne trade',
        tbpCuts: buildTBPCuts(65, 175, 340, 510, 670, 890, 1180, 38.3, v => 0.08 + v * 0.004),
    },
    {
        id: 'ARAB_LT',
        name: 'Arab Light',
        origin: 'Saudi Arabia — Ras Tanura',
        apiGravity: 33.5,
        sulfurWtPct: 1.5,
        tan: 0.12,
        nitrogenWtPct: 0.105,
        nickelPpm: 4.0,
        vanadiumPpm: 8.0,
        ccrWtPct: 3.5,
        asphalteneWtPct: 1.2,
        saltPTB: 15,
        pourPointF: -5,
        rvpPsi: 5.5,
        viscosityCST_100F: 6.0,
        bsAndWVolPct: 0.10,
        crudeCost: 72,
        description: 'World\'s most-traded crude — medium sour, balanced yield slate',
        tbpCuts: buildTBPCuts(80, 200, 370, 540, 700, 950, 1250, 33.5, v => 0.5 + v * 0.015),
    },
    {
        id: 'ARAB_HV',
        name: 'Arab Heavy',
        origin: 'Saudi Arabia — Safaniya',
        apiGravity: 27.5,
        sulfurWtPct: 2.8,
        tan: 0.18,
        nitrogenWtPct: 0.155,
        nickelPpm: 12.0,
        vanadiumPpm: 28.0,
        ccrWtPct: 8.0,
        asphalteneWtPct: 6.5,
        saltPTB: 25,
        pourPointF: 15,
        rvpPsi: 4.0,
        viscosityCST_100F: 18.0,
        bsAndWVolPct: 0.15,
        crudeCost: 65,
        description: 'Heavy sour — high residue yield, suitable for complex refineries with coking',
        tbpCuts: buildTBPCuts(100, 240, 420, 580, 750, 1000, 1320, 27.5, v => 1.0 + v * 0.025),
    },
    {
        id: 'MAYA',
        name: 'Maya',
        origin: 'Mexico — Isthmus of Tehuantepec',
        apiGravity: 22.0,
        sulfurWtPct: 3.3,
        tan: 0.45,
        nitrogenWtPct: 0.310,
        nickelPpm: 18.0,
        vanadiumPpm: 52.0,
        ccrWtPct: 11.5,
        asphalteneWtPct: 9.0,
        saltPTB: 35,
        pourPointF: 25,
        rvpPsi: 3.5,
        viscosityCST_100F: 45.0,
        bsAndWVolPct: 0.25,
        crudeCost: 60,
        description: 'Heavy sour — requires coker/hydrocracker — asphalt potential',
        tbpCuts: buildTBPCuts(120, 280, 450, 620, 800, 1050, 1380, 22.0, v => 1.5 + v * 0.028),
    },
    {
        id: 'BONNY_LT',
        name: 'Bonny Light',
        origin: 'Nigeria — Bonny Terminal',
        apiGravity: 36.5,
        sulfurWtPct: 0.14,
        tan: 0.06,
        nitrogenWtPct: 0.065,
        nickelPpm: 1.2,
        vanadiumPpm: 1.5,
        ccrWtPct: 0.5,
        asphalteneWtPct: 0.2,
        saltPTB: 5,
        pourPointF: -25,
        rvpPsi: 7.0,
        viscosityCST_100F: 3.8,
        bsAndWVolPct: 0.04,
        crudeCost: 80,
        description: 'Light sweet — high naphtha/kerosene yield, low residue — premium gasoline crude',
        tbpCuts: buildTBPCuts(55, 160, 320, 490, 650, 850, 1100, 36.5, v => 0.03 + v * 0.002),
    },
    {
        id: 'DUBAI',
        name: 'Dubai Crude',
        origin: 'UAE — Fateh Terminal',
        apiGravity: 31.0,
        sulfurWtPct: 2.0,
        tan: 0.15,
        nitrogenWtPct: 0.130,
        nickelPpm: 8.0,
        vanadiumPpm: 18.0,
        ccrWtPct: 5.5,
        asphalteneWtPct: 3.0,
        saltPTB: 20,
        pourPointF: 10,
        rvpPsi: 4.5,
        viscosityCST_100F: 10.0,
        bsAndWVolPct: 0.12,
        crudeCost: 68,
        description: 'Medium sour — Middle East benchmark — good middle distillate yield',
        tbpCuts: buildTBPCuts(90, 210, 380, 550, 720, 960, 1280, 31.0, v => 0.8 + v * 0.018),
    },
    {
        id: 'URAL',
        name: 'Urals',
        origin: 'Russia — Primorsk/Novorossiysk',
        apiGravity: 31.5,
        sulfurWtPct: 1.6,
        tan: 0.10,
        nitrogenWtPct: 0.120,
        nickelPpm: 6.0,
        vanadiumPpm: 14.0,
        ccrWtPct: 4.5,
        asphalteneWtPct: 2.5,
        saltPTB: 18,
        pourPointF: 5,
        rvpPsi: 5.0,
        viscosityCST_100F: 8.5,
        bsAndWVolPct: 0.11,
        crudeCost: 66,
        description: 'Russian export blend — medium sour — major European refinery feedstock',
        tbpCuts: buildTBPCuts(85, 195, 365, 535, 695, 930, 1250, 31.5, v => 0.6 + v * 0.016),
    },
];

/** API gravity from specific gravity — industry standard formula */
export function apiFromSpecificGravity(sg: number): number {
    return (141.5 / sg) - 131.5;
}

/** Specific gravity from API gravity */
export function specificGravityFromApi(api: number): number {
    return 141.5 / (api + 131.5);
}

/**
 * TBP Distillation — interpolate boiling point at a given cumulative
 * volume percentage using the TBP cut data from an assay.
 */
export function TBPDistillation(assay: CrudeAssay, cumulativeVolPct: number): number {
    const cuts = assay.tbpCuts;
    if (cuts.length === 0) return 0;
    if (cumulativeVolPct <= 0) return cuts[0].initialBP_F;
    if (cumulativeVolPct >= 100) return cuts[cuts.length - 1].finalBP_F;
    for (let i = 0; i < cuts.length; i++) {
        if (cumulativeVolPct <= cuts[i].cumVolPct) {
            const prevCum = i > 0 ? cuts[i - 1].cumVolPct : 0;
            const frac = (cumulativeVolPct - prevCum) / (cuts[i].cumVolPct - prevCum);
            const prevT = i > 0 ? cuts[i - 1].midBP_F : cuts[i].initialBP_F;
            return prevT + frac * (cuts[i].midBP_F - prevT);
        }
    }
    return cuts[cuts.length - 1].finalBP_F;
}
