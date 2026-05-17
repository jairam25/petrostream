/**
 * Phase 8: RETAIL & FUEL DISPENSING
 * PetroStream Retail Engineering Calculation Library
 * 
 * 10 Sub-Steps:
 *  8.1  — Site Selection & Development
 *  8.2  — Underground Storage Tank (UST) Systems
 *  8.3  — Fuel Dispensing Systems
 *  8.4  — Retail POS & Payment Systems
 *  8.5  — Retail Pricing Strategy
 *  8.6  — Station Operations & Management
 *  8.7  — Convenience Store & Non-Fuel Revenue
 *  8.8  — Car Wash & Ancillary Services
 *  8.9  — Retail HSE
 *  8.10 — Energy Transition & Future of Fuel Retail
 */

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

/** Run Monte Carlo simulation */
export function monteCarlo(
    samples: number,
    generator: () => number
): { p10: number; p50: number; p90: number; mean: number; stdev: number; values: number[] } {
    const vals: number[] = [];
    for (let i = 0; i < samples; i++) vals.push(generator());
    vals.sort((a, b) => a - b);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    return {
        p10: vals[Math.floor(samples * 0.1)],
        p50: vals[Math.floor(samples * 0.5)],
        p90: vals[Math.floor(samples * 0.9)],
        mean,
        stdev: Math.sqrt(variance),
        values: vals
    };
}

/** Normal distribution random using Box-Muller */
export function normalRandom(mean: number, stdev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdev;
}

/** Triangular distribution random */
export function triangularRandom(min: number, mode: number, max: number): number {
    const u = Math.random();
    const fc = (mode - min) / (max - min);
    if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min));
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

// ══════════════════════════════════════════════════════════════
// 8.1 — SITE SELECTION & DEVELOPMENT
// ══════════════════════════════════════════════════════════════

export interface SiteSelectionInputs {
    // Traffic
    adtVehiclesPerDay: number;           // annual avg daily traffic
    trafficGrowthRatePct: number;        // annual growth %
    captureRatePct: number;              // % of ADT that stops
    avgGallonsPerFill: number;           // gallons per transaction
    // Demographics
    populationRadius5Mi: number;         // population in 5-mile trade area
    medianHouseholdIncome: number;       // $
    avgCommuteMinutes: number;
    competingStations: number;           // within 5 miles
    // Site
    landAcres: number;
    landCostPerAcre: number;
    constructionCostMM: number;
    equipmentCostMM: number;
    // Economics
    fuelMarginPerGal: number;
    discountRatePct: number;
    projectLifeYears: number;
    // Business model
    businessModel: 'coco' | 'codo' | 'dodo';  // company-owned/operated, dealer, etc.
}

export interface SiteSelectionResult {
    estimatedGallonsPerMonth: number;
    estimatedGallonsPerYear: number;
    tradeAreaSpendingPower: number;
    marketConcentrationHHI: number;
    competingStationCaptureLoss: number;
    totalCapex: number;
    monthlyFixedCost: number;
    monthlyVariableCost: number;
    breakEvenGallonsPerMonth: number;
    breakEvenCaptureRatePct: number;
    npv10yr: number;
    irrApprox: number;
    siteScoreOutOf100: number;
    cocoVsCodoNPV: { coco: number; codo: number; dodo: number };
}

export function calculateSiteSelection(inp: SiteSelectionInputs): SiteSelectionResult {
    // Traffic-based volume estimate
    const dailyCapture = inp.adtVehiclesPerDay * (inp.captureRatePct / 100);
    const totalDispensings = inp.competingStations + 1;
    const effectiveCapture = dailyCapture / totalDispensings;
    const gallonsPerDay = effectiveCapture * inp.avgGallonsPerFill;
    const gallonsPerMonth = gallonsPerDay * 30;
    const gallonsPerYear = gallonsPerDay * 365;

    // Trade area spending power
    const spendingPower = inp.populationRadius5Mi * inp.medianHouseholdIncome;

    // Market concentration — simplified HHI (competitor count proxy)
    const marketShareEach = 1 / (inp.competingStations + 1);
    const hhi = (inp.competingStations + 1) * marketShareEach * marketShareEach * 10000;

    // CAPEX
    const landCost = inp.landAcres * inp.landCostPerAcre;
    const totalCapex = landCost + inp.constructionCostMM * 1e6 + inp.equipmentCostMM * 1e6;

    // Monthly costs (rough model)
    const annualDepreciation = totalCapex / inp.projectLifeYears;
    const monthlyFixedCost = (annualDepreciation / 12) + (totalCapex * 0.03 / 12); // 3% maintenance/insurance
    const monthlyVariableCost = gallonsPerMonth * 0.08; // ~8¢ per gallon variable

    // Break-even
    const breakEvenGalPerMonth = (monthlyFixedCost) / (inp.fuelMarginPerGal - 0.08);
    const breakEvenCaptureRate = (breakEvenGalPerMonth / 30 / inp.adtVehiclesPerDay / inp.avgGallonsPerFill) * 100;

    // NPV (10yr simplified)
    const annualCashFlow = (gallonsPerYear * inp.fuelMarginPerGal) - (monthlyFixedCost + monthlyVariableCost) * 12;
    const r = inp.discountRatePct / 100;
    let npv = -totalCapex;
    for (let t = 1; t <= Math.min(inp.projectLifeYears, 10); t++) {
        npv += annualCashFlow / ((1 + r) ** t);
    }

    // Approximate IRR
    const avgROI = annualCashFlow / totalCapex;
    const irrApprox = avgROI * 100 - 2;

    // Business model comparison
    const cocoMargin = 0.20;
    const codoMargin = 0.08;
    const dodoMargin = 0.04;
    const cocoNPV = npv; // company operated gets full margin
    const codoNPV = calculateModelNPV(totalCapex * 0.5, gallonsPerYear, codoMargin, inp);
    const dodoNPV = calculateModelNPV(totalCapex * 0.1, gallonsPerYear, dodoMargin, inp);

    // Site score (0-100)
    const score = Math.min(100, Math.max(0,
        30 * (gallonsPerMonth / 300000) +       // volume score (up to 30)
        20 * (inp.populationRadius5Mi / 50000) + // demographic (up to 20)
        20 * (1 - marketShareEach * 3) +         // competition (up to 20)
        15 * (npv > 0 ? (npv / 5e6) : 0) +      // profitability (up to 15)
        15 * (inp.adtVehiclesPerDay / 50000)     // traffic (up to 15)
    ) * 100);

    return {
        estimatedGallonsPerMonth: gallonsPerMonth,
        estimatedGallonsPerYear: gallonsPerYear,
        tradeAreaSpendingPower: spendingPower,
        marketConcentrationHHI: hhi,
        competingStationCaptureLoss: (dailyCapture * (inp.competingStations / (inp.competingStations + 1))) * 365,
        totalCapex,
        monthlyFixedCost,
        monthlyVariableCost,
        breakEvenGallonsPerMonth: breakEvenGalPerMonth,
        breakEvenCaptureRatePct: breakEvenCaptureRate,
        npv10yr: npv,
        irrApprox,
        siteScoreOutOf100: score,
        cocoVsCodoNPV: { coco: cocoNPV, codo: codoNPV, dodo: dodoNPV }
    };
}

function calculateModelNPV(capex: number, galPerYear: number, margin: number, inp: SiteSelectionInputs): number {
    const cf = galPerYear * margin - 500000;
    let npv = -capex;
    const r = inp.discountRatePct / 100;
    for (let t = 1; t <= inp.projectLifeYears; t++) npv += cf / ((1 + r) ** t);
    return npv;
}

/** Multi-factor site viability scoring with weighted factors */
export function multiFactorSiteScore(weights: {
    traffic: number; demographics: number; competition: number; access: number; visibility: number; cost: number;
}, scores: {
    traffic: number; demographics: number; competition: number; access: number; visibility: number; cost: number;
}): number {
    const totalWt = weights.traffic + weights.demographics + weights.competition +
        weights.access + weights.visibility + weights.cost;
    return (
        weights.traffic * scores.traffic +
        weights.demographics * scores.demographics +
        weights.competition * scores.competition +
        weights.access * scores.access +
        weights.visibility * scores.visibility +
        weights.cost * scores.cost
    ) / totalWt;
}

// ══════════════════════════════════════════════════════════════
// 8.2 — UNDERGROUND STORAGE TANK (UST) SYSTEMS
// ══════════════════════════════════════════════════════════════

export interface USTConfigInputs {
    // Tank configuration
    totalCapacityGallons: number;
    numTanks: number;
    numCompartments: number;
    tankDiameterFt: number;
    tankLengthFt: number;
    tankWallThicknessIn: number;
    tankMaterialDensityLbPerFt3: number; // steel = 490
    // Environmental
    groundwaterDepthFt: number;
    soilDensityLbPerFt3: number;
    // Leak detection
    monthlyThroughputGal: number;
    leakDetectionThresholdGph: number; // 0.1 or 0.2
    interstitialMonitoring: boolean;
    sirConfidenceLevelPct: number; // Statistical Inventory Reconciliation
    // Cathodic protection
    cpCurrentDensityMaPerFt2: number;
    steelSurfaceAreaFt2: number;
    // Financial
    remediationCostPerFt3: number;
    cleanupCostPerGallonSpilled: number;
    financialAssuranceMM: number;
    // Age
    tankAgeYears: number;
    expectedTankLifeYears: number;
}

export interface USTResult {
    tankVolumeGallons: number;
    buoyancyForceLb: number;
    deadmanWeightRequiredLb: number;
    flotationSafe: boolean;
    leakProbDetectionPct: number;
    leakProbabilityAnnual: number;
    annualLeakDetectionCost: number;
    sirMinimumDetectableLossGal: number;
    cpCurrentRequiredAmps: number;
    remediationCostEstimate: number;
    financialAssuranceAdequate: boolean;
    tankReplacementYear: number;
    complianceScorePct: number;
    environmentalRiskScore: number;
}

export function analyzeUSTSystem(inp: USTConfigInputs): USTResult {
    // Tank volume
    const singleTankVol = inp.totalCapacityGallons / inp.numTanks;

    // Buoyancy (Archimedes)
    const tankVolumeFt3 = singleTankVol / 7.48052;
    const displacedSoilWeight = tankVolumeFt3 * inp.soilDensityLbPerFt3;
    const emptyTankWeight = Math.PI * inp.tankDiameterFt * inp.tankLengthFt *
        (inp.tankWallThicknessIn / 12) * inp.tankMaterialDensityLbPerFt3;
    const buoyancyForce = Math.max(0, displacedSoilWeight - emptyTankWeight);
    const deadmanWeightRequired = buoyancyForce * 1.5; // 1.5 safety factor
    const flotationSafe = buoyancyForce > 0 ? buoyancyForce <= emptyTankWeight : true;

    // Leak detection probability (simplified model)
    const baseLeakProb = 0.001; // 0.1% per year base
    const ageFactor = inp.tankAgeYears / inp.expectedTankLifeYears;
    const throughputFactor = Math.min(2, inp.monthlyThroughputGal / 500000);
    const leakProbAnnual = baseLeakProb * (1 + ageFactor * 5 + throughputFactor * 0.5);
    const leakProbDetectionPct = inp.interstitialMonitoring
        ? 99.5
        : inp.sirConfidenceLevelPct * (inp.leakDetectionThresholdGph <= 0.1 ? 0.95 : 0.70);

    // SIR minimum detectable
    const sirMinDetectLoss = inp.monthlyThroughputGal * 0.005 * (1 - inp.sirConfidenceLevelPct / 100);

    // Cathodic protection
    const cpCurrentRequired = inp.cpCurrentDensityMaPerFt2 * inp.steelSurfaceAreaFt2 / 1000; // mA → A

    // Annual leak detection cost
    const annualLD = inp.interstitialMonitoring ? 2500 : 800 + (inp.sirConfidenceLevelPct > 90 ? 1200 : 0);

    // Remediation cost estimate
    const worstCaseReleaseGal = inp.monthlyThroughputGal * 0.02; // 2% monthly as worst credible
    const remediationCost = worstCaseReleaseGal * inp.cleanupCostPerGallonSpilled *
        inp.soilDensityLbPerFt3 / 62.4 * 1.3;

    // Financial assurance check (EPA 40 CFR 280)
    const financialAssuranceAdequate = inp.financialAssuranceMM >= 2.0;

    // Compliance score
    const complianceScore = Math.max(0, Math.min(100,
        40 * (inp.interstitialMonitoring ? 1 : 0.6) +
        20 * (inp.tankAgeYears < 20 ? 1 : Math.max(0, 1 - (inp.tankAgeYears - 20) / 10)) +
        20 * (flotationSafe ? 1 : 0.3) +
        10 * (inp.leakDetectionThresholdGph <= 0.1 ? 1 : 0.5) +
        10 * (financialAssuranceAdequate ? 1 : 0)
    ));

    // Environmental risk score
    const envRiskScore = Math.min(100, Math.max(0,
        30 * ageFactor +
        20 * (inp.groundwaterDepthFt < 10 ? 1 : 0.5) +
        20 * (1 - leakProbDetectionPct / 100) +
        15 * throughputFactor +
        15 * (1 - (flotationSafe ? 1 : 0))
    ) * 100);

    return {
        tankVolumeGallons: singleTankVol,
        buoyancyForceLb: buoyancyForce,
        deadmanWeightRequiredLb: deadmanWeightRequired,
        flotationSafe,
        leakProbDetectionPct: leakProbDetectionPct,
        leakProbabilityAnnual: leakProbAnnual,
        annualLeakDetectionCost: annualLD,
        sirMinimumDetectableLossGal: sirMinDetectLoss,
        cpCurrentRequiredAmps: cpCurrentRequired,
        remediationCostEstimate: remediationCost,
        financialAssuranceAdequate,
        tankReplacementYear: new Date().getFullYear() + Math.max(0, inp.expectedTankLifeYears - inp.tankAgeYears),
        complianceScorePct: complianceScore,
        environmentalRiskScore: envRiskScore
    };
}

// ══════════════════════════════════════════════════════════════
// 8.3 — FUEL DISPENSING SYSTEMS
// ══════════════════════════════════════════════════════════════

export interface DispenserInputs {
    numDispensers: number;
    numHosesPerDispenser: number;
    designFlowRateGpm: number;          // per hose
    hoseDiameterIn: number;             // 0.75 or 1.0 typically
    hoseLengthFt: number;
    meterTolerancePct: number;          // NIST H44: ±0.3%
    monthlyVolumeGal: number;
    ambientTempF: number;
    productApiGravity: number;
    dispenserCapexPerUnit: number;
    stpCapex: number;
    annualMaintenancePerDispenser: number;
    electricityCostPerKWh: number;
    stpMotorHP: number;
}

export interface DispenserResult {
    simultaneousFlowRateGpm: number;
    totalMonthlyThroughputGal: number;
    maxThroughputPerHoseGpm: number;
    hosePressureLossPsi: number;
    stpSizingHP: number;
    meterMaxErrorGalPer1kGal: number;
    meterRevenueLossPerYear: number;
    atcTempCorrectionFactor: number;
    atcVolumeDeltaGal: number;
    breakawayForceLb: number;
    dispenserLifecycleCost: number;
    costPerDispensedGallon: number;
    utilizationRatePct: number;
}

export function analyzeDispenserSystem(inp: DispenserInputs): DispenserResult {
    // Simultaneous flow capacity
    const totalHoses = inp.numDispensers * inp.numHosesPerDispenser;
    const simultaneityFactor = Math.max(0.3, 1 - (totalHoses - 4) * 0.05); // fewer hoses = higher concurrency
    const simultaneousFlowRate = totalHoses * inp.designFlowRateGpm * simultaneityFactor;

    // Throughput per hose
    const maxThroughputPerHose = inp.designFlowRateGpm * 60 * 20; // 20 hrs/day max
    const totalMonthlyThroughput = inp.monthlyVolumeGal;

    // Hose pressure loss (Darcy-Weisbach simplified for gasoline)
    const vFtPerSec = inp.designFlowRateGpm / (449 * Math.PI * (inp.hoseDiameterIn / 24) ** 2);
    const re = (vFtPerSec * (inp.hoseDiameterIn / 12)) / (4.2e-6); // ≈ kinematic viscosity of gasoline
    const frictionFactor = re > 2300 ? 0.316 / (re ** 0.25) : 64 / re;
    const hosePressureLoss = frictionFactor * (inp.hoseLengthFt / (inp.hoseDiameterIn / 12)) *
        (44.5 * vFtPerSec ** 2 / (2 * 32.174)) / 144; // psi

    // STP sizing
    const stpSizingHP = (simultaneousFlowRate * 35 * 144) / (1714 * 0.7); // ΔP=35psi, η=0.7
    const actualSTPHP = Math.max(stpSizingHP, inp.stpMotorHP);

    // Meter accuracy (NIST H44)
    const meterMaxErrorGal = inp.meterTolerancePct / 100 * 1000; // gallons error per 1000 gal
    const meterRevenueLossPerYear = (meterMaxErrorGal / 1000) * inp.monthlyVolumeGal * 12 * 3.50; // $3.50/gal retail

    // ATC (Automatic Temperature Compensation)
    const fToCC = (f: number) => (f - 32) * 5 / 9;
    const ctl = Math.exp(-0.0007 * (fToCC(inp.ambientTempF) - 15)); // simplified CTL at 15°C/60°F ref
    const atcFactor = ctl;
    const atcVolumeDelta = inp.monthlyVolumeGal * (1 - ctl); // monthly gain/loss

    // Breakaway force (shear valve)
    const breakawayForce = inp.designFlowRateGpm * 8.33 * vFtPerSec / 32.174 * 2.2; // lb

    // Lifecycle cost
    const dispenserCapex = inp.numDispensers * inp.dispenserCapexPerUnit;
    const totalCapex = dispenserCapex + inp.stpCapex;
    const annualOpex = inp.numDispensers * inp.annualMaintenancePerDispenser +
        actualSTPHP * 0.746 * 8760 * 0.5 * inp.electricityCostPerKWh;
    const lifeYears = 15;
    const dispenserLifecycleCost = totalCapex + annualOpex * lifeYears;
    const costPerGallon = (totalCapex / lifeYears + annualOpex) / (inp.monthlyVolumeGal * 12);

    // Utilization
    const utilizationRate = (inp.monthlyVolumeGal / 30 / 20) / (totalHoses * inp.designFlowRateGpm * 60) * 100;

    return {
        simultaneousFlowRateGpm: simultaneousFlowRate,
        totalMonthlyThroughputGal: totalMonthlyThroughput,
        maxThroughputPerHoseGpm: maxThroughputPerHose,
        hosePressureLossPsi: hosePressureLoss,
        stpSizingHP: actualSTPHP,
        meterMaxErrorGalPer1kGal: meterMaxErrorGal,
        meterRevenueLossPerYear: meterRevenueLossPerYear,
        atcTempCorrectionFactor: atcFactor,
        atcVolumeDeltaGal: atcVolumeDelta,
        breakawayForceLb: breakawayForce,
        dispenserLifecycleCost: dispenserLifecycleCost,
        costPerDispensedGallon: costPerGallon,
        utilizationRatePct: utilizationRate
    };
}

// ══════════════════════════════════════════════════════════════
// 8.4 — RETAIL POS & PAYMENT SYSTEMS
// ══════════════════════════════════════════════════════════════

export interface POSInputs {
    monthlyVolumeGal: number;
    retailPricePerGal: number;
    cashPct: number;
    creditPct: number;
    fleetCardPct: number;
    mobilePayPct: number;
    creditProcessingFeePct: number;     // 1.5-3.5%
    fleetProcessingFeePct: number;
    avgTransactionGal: number;
    emvUpgradeCost: number;             // CAPEX to upgrade
    emvChargebackReductionPct: number;
    preEMVChargebackCostPerYear: number;
    pciComplianceCostPerYear: number;
    holdAuthorizationAmount: number;     // Visa $175
    holdReconciliationLossPct: number;
    loyaltyAppCostPerYear: number;
    loyaltyAppAdoptionPct: number;
    loyaltyDiscountPerGal: number;
}

export interface POSResult {
    monthlyRevenue: number;
    monthlyProcessingFees: number;
    processingFeeEffective: number;
    cashVsCreditMarginDelta: number;
    emvROIPaybackMonths: number;
    emv5yrNPV: number;
    pciComplianceAdequate: boolean;
    holdReconciliationAnnualLoss: number;
    loyaltyProgramNetBenefit: number;
    fleetRevenueShare: number;
    processingCostPerGal: number;
    transactionCountMonthly: number;
    paymentMethodRevenue: { cash: number; credit: number; fleet: number; mobile: number };
}

export function analyzePOSSystem(inp: POSInputs): POSResult {
    const monthlyRevenue = inp.monthlyVolumeGal * inp.retailPricePerGal;
    const transactions = inp.monthlyVolumeGal / inp.avgTransactionGal;

    // Fee breakdown
    const cashRevenue = monthlyRevenue * (inp.cashPct / 100);
    const creditRevenue = monthlyRevenue * (inp.creditPct / 100);
    const fleetRevenue = monthlyRevenue * (inp.fleetCardPct / 100);
    const mobileRevenue = monthlyRevenue * (inp.mobilePayPct / 100);

    const creditFees = creditRevenue * (inp.creditProcessingFeePct / 100);
    const fleetFees = fleetRevenue * (inp.fleetProcessingFeePct / 100);
    const totalFees = creditFees + fleetFees;
    const feeEffective = (totalFees / monthlyRevenue) * 100;

    // Cash vs Credit margin erosion
    const cashMargin = cashRevenue * 0.15; // no fee, full margin
    const creditMargin = creditRevenue * 0.12; // ~3% fee eats into margin
    const cashVsCreditDelta = cashMargin - creditMargin;

    // EMV ROI
    const annualSavings = inp.preEMVChargebackCostPerYear * (inp.emvChargebackReductionPct / 100);
    const emvPaybackMonths = (inp.emvUpgradeCost / annualSavings) * 12;
    const emv5yrNPV = -inp.emvUpgradeCost + annualSavings * 4.33; // PV of 5yr annuity at 5%

    // Hold reconciliation loss
    const holdLoss = transactions * inp.holdAuthorizationAmount * (inp.holdReconciliationLossPct / 100);
    const holdAnnualLoss = holdLoss * 12;

    // Loyalty program
    const loyaltyCost = inp.loyaltyDiscountPerGal * inp.monthlyVolumeGal * (inp.loyaltyAppAdoptionPct / 100);
    const loyaltyBenefit = inp.loyaltyAppAdoptionPct / 100 * inp.monthlyVolumeGal * 0.15; // incremental margin from loyalty
    const loyaltyNetBenefit = loyaltyBenefit - loyaltyCost - inp.loyaltyAppCostPerYear / 12;

    return {
        monthlyRevenue,
        monthlyProcessingFees: totalFees,
        processingFeeEffective: feeEffective,
        cashVsCreditMarginDelta: cashVsCreditDelta,
        emvROIPaybackMonths: emvPaybackMonths,
        emv5yrNPV: emv5yrNPV,
        pciComplianceAdequate: inp.pciComplianceCostPerYear > 5000,
        holdReconciliationAnnualLoss: holdAnnualLoss,
        loyaltyProgramNetBenefit: loyaltyNetBenefit,
        fleetRevenueShare: (fleetRevenue / monthlyRevenue) * 100,
        processingCostPerGal: totalFees / inp.monthlyVolumeGal,
        transactionCountMonthly: transactions,
        paymentMethodRevenue: {
            cash: cashRevenue,
            credit: creditRevenue,
            fleet: fleetRevenue,
            mobile: mobileRevenue
        }
    };
}

// ══════════════════════════════════════════════════════════════
// 8.5 — RETAIL PRICING STRATEGY
// ══════════════════════════════════════════════════════════════

export interface PricingInputs {
    crudeCostPerBbl: number;
    rackWholesalePerGal: number;
    federalTaxPerGal: number;
    stateTaxPerGal: number;
    deliveryCostPerGal: number;
    targetMarginPerGal: number;
    competitorPricePerGal: number;
    priceGapToCompetitor: number;
    priceElasticity: number;              // how much volume changes per 1¢ price change
    baseVolumePerMonth: number;
    premiumPriceGap: number;
    midGradePriceGap: number;
    regularSharePct: number;
    midGradeSharePct: number;
    premiumSharePct: number;
    brandedPremiumPct: number;            // branded vs unbranded markup
    hypermarketDisruptionPct: number;     // market share erosion from hypermarkets
}

export interface PricingResult {
    pumpPricePerGal: number;
    priceBuildup: { crude: number; rack: number; taxes: number; delivery: number; margin: number; retail: number };
    competitorPrice: number;
    priceGap: number;
    optimalPricePerGal: number;
    optimalVolumePerMonth: number;
    optimalMarginPerMonth: number;
    currentMarginPerMonth: number;
    elasticityMultiplier: number;
    rocketsAndFeathersAsymmetry: number;
    blendedPumpPrice: number;
    blendedMargin: number;
    hypermarketVolumeLoss: number;
    brandedPriceDiff: number;
    seasonalAdjustment: number;
}

export function optimizePricingStrategy(inp: PricingInputs): PricingResult {
    // Price buildup
    const crudeCostPerGal = inp.crudeCostPerBbl / 42;
    const sumCosts = inp.rackWholesalePerGal + inp.federalTaxPerGal + inp.stateTaxPerGal + inp.deliveryCostPerGal;
    const targetPumpPrice = inp.rackWholesalePerGal + inp.federalTaxPerGal + inp.stateTaxPerGal + inp.deliveryCostPerGal + inp.targetMarginPerGal;

    // Rockets and feathers asymmetry
    const rocketsFeathersGap = inp.rackWholesalePerGal > 3.00 ? 0.05 : 0.02;

    // Price elasticity optimization
    const priceRange = 20; // ±20 cents
    let bestMargin = -Infinity;
    let bestPrice = targetPumpPrice;
    let bestVolume = inp.baseVolumePerMonth;
    for (let dp = -priceRange; dp <= priceRange; dp += 0.5) {
        const testPrice = targetPumpPrice + dp / 100;
        const volumeChange = -(inp.priceElasticity * dp * inp.baseVolumePerMonth / 100) / 100;
        const testVolume = Math.max(0, inp.baseVolumePerMonth + volumeChange);
        const testMargin = testVolume * (testPrice - sumCosts);
        if (testMargin > bestMargin) {
            bestMargin = testMargin;
            bestPrice = testPrice;
            bestVolume = testVolume;
        }
    }

    const currentMargin = inp.baseVolumePerMonth * (targetPumpPrice - sumCosts);

    // Grade differential
    const blendedPrice = inp.regularSharePct / 100 * targetPumpPrice +
        inp.midGradeSharePct / 100 * (targetPumpPrice + inp.midGradePriceGap) +
        inp.premiumSharePct / 100 * (targetPumpPrice + inp.premiumPriceGap);
    const blendedMargin = blendedPrice - sumCosts;

    // Hypermarket disruption
    const hypermarketLoss = inp.baseVolumePerMonth * (inp.hypermarketDisruptionPct / 100);

    return {
        pumpPricePerGal: targetPumpPrice,
        priceBuildup: {
            crude: crudeCostPerGal,
            rack: inp.rackWholesalePerGal,
            taxes: inp.federalTaxPerGal + inp.stateTaxPerGal,
            delivery: inp.deliveryCostPerGal,
            margin: inp.targetMarginPerGal,
            retail: targetPumpPrice
        },
        competitorPrice: inp.competitorPricePerGal,
        priceGap: targetPumpPrice - inp.competitorPricePerGal,
        optimalPricePerGal: bestPrice,
        optimalVolumePerMonth: bestVolume,
        optimalMarginPerMonth: bestMargin,
        currentMarginPerMonth: currentMargin,
        elasticityMultiplier: inp.priceElasticity,
        rocketsAndFeathersAsymmetry: rocketsFeathersGap,
        blendedPumpPrice: blendedPrice,
        blendedMargin: blendedMargin,
        hypermarketVolumeLoss: hypermarketLoss,
        brandedPriceDiff: targetPumpPrice * (inp.brandedPremiumPct / 100),
        seasonalAdjustment: new Date().getMonth() < 3 || new Date().getMonth() > 8 ? -0.03 : 0.02
    };
}

// ══════════════════════════════════════════════════════════════
// 8.6 — STATION OPERATIONS & MANAGEMENT
// ══════════════════════════════════════════════════════════════

export interface OperationsInputs {
    monthlyGallonsSold: number;
    avgTransactionGal: number;
    employeesPerShift: number;
    shiftsPerDay: number;
    hourlyWage: number;
    monthlyFixedCosts: number;
    deliveriesPerMonth: number;
    avgDeliveryGal: number;
    atgReconciliationVariancePct: number;
    dispenserAgeYears: number;
    dispenserLifeYears: number;
    ustAgeYears: number;
    ustLifeYears: number;
    stpAgeYears: number;
    stpLifeYears: number;
    canopyAgeYears: number;
    canopyLifeYears: number;
    workOrderBacklog: number;
    criticalWO: number;
    hseWO: number;
}

export interface OperationsResult {
    transactionsPerLaborHour: number;
    laborCostPerGal: number;
    laborUtilizationPct: number;
    optimalStaffing: number;
    deliveryFrequencyDays: number;
    inventoryTurnoverDays: number;
    atgVarianceGal: number;
    atgVarianceDollars: number;
    equipmentLifecycle: { dispenser: number; ust: number; stp: number; canopy: number };
    nextMajorReplacementYear: number;
    maintenanceBacklogScore: number;
    monthlyOpex: number;
    opexPerGal: number;
    cashVsCardTrendPct: number;
}

export function analyzeStationOperations(inp: OperationsInputs): OperationsResult {
    const transactions = inp.monthlyGallonsSold / inp.avgTransactionGal;
    const laborHours = inp.employeesPerShift * inp.shiftsPerDay * 30;
    const laborCost = laborHours * inp.hourlyWage;

    // Transactions per labor hour
    const tplh = transactions / laborHours;
    const laborCostPerGal = laborCost / inp.monthlyGallonsSold;
    const optimalStaffing = Math.ceil(transactions / (30 * inp.shiftsPerDay * 25)); // 25 transactions/hr/shift target

    // Delivery
    const deliveryFrequency = inp.monthlyGallonsSold / inp.avgDeliveryGal;
    const deliveryDays = 30 / Math.max(1, deliveryFrequency);

    // Inventory turnover
    const inventoryDays = 30 / Math.max(1, deliveryFrequency) * 2; // assume ~2 deliveries worth inventory

    // ATG variance
    const atgVarGal = inp.monthlyGallonsSold * (inp.atgReconciliationVariancePct / 100);
    const atgVarDollars = atgVarGal * 3.50;

    // Equipment lifecycle
    const nextDispenser = Math.max(0, inp.dispenserLifeYears - inp.dispenserAgeYears);
    const nextUST = Math.max(0, inp.ustLifeYears - inp.ustAgeYears);
    const nextSTP = Math.max(0, inp.stpLifeYears - inp.stpAgeYears);
    const nextCanopy = Math.max(0, inp.canopyLifeYears - inp.canopyAgeYears);
    const nextMajor = Math.min(nextDispenser, nextUST, nextSTP, nextCanopy);

    // Maintenance backlog score (weighted)
    const backlogScore = inp.criticalWO * 50 + inp.hseWO * 30 + (inp.workOrderBacklog - inp.criticalWO - inp.hseWO) * 10;

    // OPEX
    const monthlyOpex = laborCost + inp.monthlyFixedCosts + backlogScore * 5;

    return {
        transactionsPerLaborHour: tplh,
        laborCostPerGal: laborCostPerGal,
        laborUtilizationPct: (transactions / (laborHours * 25)) * 100,
        optimalStaffing,
        deliveryFrequencyDays: deliveryDays,
        inventoryTurnoverDays: inventoryDays,
        atgVarianceGal: atgVarGal,
        atgVarianceDollars: atgVarDollars,
        equipmentLifecycle: {
            dispenser: nextDispenser,
            ust: nextUST,
            stp: nextSTP,
            canopy: nextCanopy
        },
        nextMajorReplacementYear: new Date().getFullYear() + nextMajor,
        maintenanceBacklogScore: backlogScore,
        monthlyOpex,
        opexPerGal: monthlyOpex / inp.monthlyGallonsSold,
        cashVsCardTrendPct: 35 + (Math.random() - 0.5) * 10
    };
}

// ══════════════════════════════════════════════════════════════
// 8.7 — CONVENIENCE STORE & NON-FUEL REVENUE
// ══════════════════════════════════════════════════════════════

export interface CStoreInputs {
    monthlyFuelGal: number;
    fuelCustomersPerMonth: number;
    insideConversionPct: number;          // % fuel customers entering store
    avgInsideBasketSize: number;
    insideGrossMarginPct: number;
    cstoreSqFt: number;
    // Category sales ($/month)
    packagedBeverageSales: number;
    snacksSales: number;
    tobaccoSales: number;
    beerSales: number;
    candySales: number;
    foodServiceSales: number;
    generalMdseSales: number;
    // Category margins
    bevMarginPct: number;
    snackMarginPct: number;
    tobaccoMarginPct: number;
    beerMarginPct: number;
    candyMarginPct: number;
    foodServiceMarginPct: number;
    generalMarginPct: number;
    // Loyalty
    loyaltyDiscountPerGal: number;
    loyaltyInsideLiftPct: number;
    loyaltyMemberCount: number;
}

export interface CStoreResult {
    insideSalesPerMonth: number;
    insideMarginPerMonth: number;
    insideMarginEffective: number;
    fuelConversionCount: number;
    salesPerSqFt: number;
    inventoryTurnsPerYear: number;
    gmroi: number;
    loyaltyCostPerMonth: number;
    loyaltyInsideBenefit: number;
    loyaltyNetROI: number;
    categoryBreakdown: { name: string; sales: number; margin: number; marginPct: number }[];
    basketSizeDistribution: number[];
    totalStationRevenue: number;
    fuelVsInsideSplit: { fuelPct: number; insidePct: number };
}

export function analyzeCStore(inp: CStoreInputs): CStoreResult {
    // Inside sales
    const insideCustomers = inp.fuelCustomersPerMonth * (inp.insideConversionPct / 100);
    const avgBasket = inp.avgInsideBasketSize;
    const insideSales = insideCustomers * avgBasket;
    const insideMargin = insideSales * (inp.insideGrossMarginPct / 100);
    const marginEffective = (insideMargin / insideSales) * 100;

    // Fuel conversion
    const fuelConversion = insideCustomers;

    // Sales per sq ft
    const salesPerSqFt = insideSales / Math.max(1, inp.cstoreSqFt);

    // Inventory turns (assume 15% of annual sales as avg inventory)
    const avgInventoryValue = insideSales * 12 * 0.15;
    const inventoryTurns = (insideSales * 12) / Math.max(1, avgInventoryValue);
    const gmroi = (insideMargin * 12) / Math.max(1, avgInventoryValue) * 100;

    // Category breakdown
    const categories = [
        { name: 'Packaged Beverages', sales: inp.packagedBeverageSales, marginPct: inp.bevMarginPct },
        { name: 'Snacks', sales: inp.snacksSales, marginPct: inp.snackMarginPct },
        { name: 'Tobacco', sales: inp.tobaccoSales, marginPct: inp.tobaccoMarginPct },
        { name: 'Beer/Wine', sales: inp.beerSales, marginPct: inp.beerMarginPct },
        { name: 'Candy/Gum', sales: inp.candySales, marginPct: inp.candyMarginPct },
        { name: 'Food Service', sales: inp.foodServiceSales, marginPct: inp.foodServiceMarginPct },
        { name: 'General Merchandise', sales: inp.generalMdseSales, marginPct: inp.generalMarginPct },
    ];
    const catBreakdown = categories.map(c => ({
        ...c,
        margin: c.sales * (c.marginPct / 100),
    }));

    // Loyalty
    const loyaltyCost = inp.loyaltyDiscountPerGal * inp.monthlyFuelGal * (inp.loyaltyMemberCount / Math.max(1, inp.fuelCustomersPerMonth));
    const loyaltyInsideBenefit = insideSales * (inp.loyaltyInsideLiftPct / 100);
    const loyaltyNetROI = (loyaltyInsideBenefit - loyaltyCost) / Math.max(1, loyaltyCost) * 100;

    // Basket distribution (lognormal-ish)
    const basketDist = [5, 15, 25, 20, 15, 10, 7, 3].map(p => p * insideCustomers / 100);

    // Total station revenue
    const fuelRevenue = inp.monthlyFuelGal * 3.50;
    const totalRevenue = fuelRevenue + insideSales;

    return {
        insideSalesPerMonth: insideSales,
        insideMarginPerMonth: insideMargin,
        insideMarginEffective: marginEffective,
        fuelConversionCount: fuelConversion,
        salesPerSqFt,
        inventoryTurnsPerYear: inventoryTurns,
        gmroi,
        loyaltyCostPerMonth: loyaltyCost,
        loyaltyInsideBenefit: loyaltyInsideBenefit,
        loyaltyNetROI,
        categoryBreakdown: catBreakdown,
        basketSizeDistribution: basketDist,
        totalStationRevenue: totalRevenue,
        fuelVsInsideSplit: {
            fuelPct: (fuelRevenue / totalRevenue) * 100,
            insidePct: (insideSales / totalRevenue) * 100
        }
    };
}

// ══════════════════════════════════════════════════════════════
// 8.8 — CAR WASH & ANCILLARY SERVICES
// ══════════════════════════════════════════════════════════════

export interface CarWashInputs {
    washType: 'iba' | 'conveyor' | 'self-serve';
    carsPerHour: number;
    operatingHoursPerDay: number;
    daysPerMonth: number;
    averageTicketPrice: number;
    variableCostPerWash: number;
    fixedCostPerMonth: number;
    // Membership
    membershipPricePerMonth: number;
    memberCount: number;
    avgMemberWashesPerMonth: number;
    // EV
    numEVChargers: number;
    chargerCapexPerStall: number;
    chargerUtilizationPct: number;
    chargingPricePerKWh: number;
    demandChargePerMonth: number;
    avgKwhPerSession: number;
    // Water
    waterReclaimSystemEfficiency: number;
    waterCostPer1kGal: number;
    gallonsPerWash: number;
    // Propane
    propaneExchangesPerMonth: number;
    propaneRevenuePerExchange: number;
    propaneCostPerExchange: number;
}

export interface CarWashResult {
    washThroughputPerMonth: number;
    washRevenuePerMonth: number;
    washMarginPerMonth: number;
    membershipMRR: number;
    membershipBreakEvenCount: number;
    membershipProfitPerMonth: number;
    evRevenuePerMonth: number;
    evROIPaybackMonths: number;
    waterCostPerMonth: number;
    waterSavingsFromReclaim: number;
    propaneMarginPerMonth: number;
    totalAncillaryRevenue: number;
    totalAncillaryMargin: number;
}

export function analyzeAncillaryServices(inp: CarWashInputs): CarWashResult {
    // Wash throughput
    const washThroughput = inp.carsPerHour * inp.operatingHoursPerDay * inp.daysPerMonth;
    const washRevenue = washThroughput * inp.averageTicketPrice;
    const washVariableCost = washThroughput * inp.variableCostPerWash;
    const washMargin = washRevenue - washVariableCost - inp.fixedCostPerMonth;

    // Membership (subscription model)
    const membershipMRR = inp.memberCount * inp.membershipPricePerMonth;
    const membershipCost = inp.memberCount * inp.avgMemberWashesPerMonth * inp.variableCostPerWash;
    const membershipProfit = membershipMRR - membershipCost;
    const membershipBE =
        inp.fixedCostPerMonth / Math.max(0.01, inp.membershipPricePerMonth -
            inp.avgMemberWashesPerMonth * inp.variableCostPerWash);

    // EV charging
    const sessionsPerMonth = inp.numEVChargers * 30 * (inp.chargerUtilizationPct / 100) * 3;
    const kwhPerMonth = sessionsPerMonth * inp.avgKwhPerSession;
    const evRevenue = kwhPerMonth * inp.chargingPricePerKWh;
    const evCost = kwhPerMonth * 0.08 + inp.demandChargePerMonth * inp.numEVChargers;
    const evMargin = evRevenue - evCost;
    const evCapex = inp.numEVChargers * inp.chargerCapexPerStall;
    const evPayback = evMargin > 0 ? (evCapex / evMargin) : Infinity;

    // Water costs
    const waterPerMonth = (washThroughput * inp.gallonsPerWash) / 1000; // thousand gallons
    const waterSavingsFromReclaim = waterPerMonth * inp.waterReclaimSystemEfficiency * inp.waterCostPer1kGal;
    const actualWaterCost = waterPerMonth * inp.waterCostPer1kGal * (1 - inp.waterReclaimSystemEfficiency);

    // Propane
    const propaneMargin = inp.propaneExchangesPerMonth *
        (inp.propaneRevenuePerExchange - inp.propaneCostPerExchange);

    // Summary
    const totalRev = washRevenue + membershipMRR + evRevenue +
        inp.propaneExchangesPerMonth * inp.propaneRevenuePerExchange;
    const totalMargin = washMargin + membershipProfit + evMargin + propaneMargin;

    return {
        washThroughputPerMonth: washThroughput,
        washRevenuePerMonth: washRevenue,
        washMarginPerMonth: washMargin,
        membershipMRR,
        membershipBreakEvenCount: membershipBE,
        membershipProfitPerMonth: membershipProfit,
        evRevenuePerMonth: evRevenue,
        evROIPaybackMonths: evPayback,
        waterCostPerMonth: actualWaterCost,
        waterSavingsFromReclaim,
        propaneMarginPerMonth: propaneMargin,
        totalAncillaryRevenue: totalRev,
        totalAncillaryMargin: totalMargin
    };
}

// ══════════════════════════════════════════════════════════════
// 8.9 — RETAIL HSE
// ══════════════════════════════════════════════════════════════

export interface RetailHSEInputs {
    monthlyVolumeGal: number;
    numDispensers: number;
    ustAgeYears: number;
    ustComplianceScore: number;
    cashHandlingVolume: number;
    hoursOfDarknessPerDay: number;
    neighborhoodCrimeIndex: number;       // 0-100
    totalEmployees: number;
    annualWorkHours: number;
    recordableIncidents: number;
    lostTimeIncidents: number;
    spillEventsPerYear: number;
    stormwaterFlowRateGpm: number;
    stageIIVaporRecovery: boolean;
    fireSuppressionTested: boolean;
    emergencyShutoffDistanceFt: number;
}

export interface RetailHSEResult {
    nfpa30aComplianceScore: number;
    emergencyShutoffCoveragePct: number;
    trir: number;
    dart: number;
    robberyRiskIndex: number;
    robberyRiskCategory: string;
    releaseProbability: number;
    releaseCostEstimate: number;
    oilWaterSeparatorSizeGal: number;
    vaporRecoveredTonsPerYear: number;
    safetyTrainingCompliancePct: number;
    overallHSEScore: number;
}

export function evaluateRetailHSE(inp: RetailHSEInputs): RetailHSEResult {
    // NFPA 30A compliance
    const fireScore =
        (inp.fireSuppressionTested ? 25 : 0) +
        Math.min(25, inp.emergencyShutoffDistanceFt / 100 * 25) +
        (inp.stageIIVaporRecovery ? 20 : 10) +
        Math.min(15, (100 - inp.ustAgeYears) / 100 * 15) +
        15 * (inp.ustComplianceScore / 100);
    const nfpaScore = Math.min(100, fireScore);

    // Emergency shutoff coverage
    const shutoffCoverage = Math.min(100, inp.emergencyShutoffDistanceFt / 150 * 100);

    // OSHA metrics
    const trir = (inp.recordableIncidents * 200000) / Math.max(1, inp.annualWorkHours);
    const dart = (inp.lostTimeIncidents * 200000) / Math.max(1, inp.annualWorkHours);

    // Robbery risk index (0-100)
    const robberyRisk = Math.min(100,
        35 * (inp.cashHandlingVolume > 2000 ? 1 : 0.5) +
        25 * (inp.hoursOfDarknessPerDay / 16 * 100) +
        40 * (inp.neighborhoodCrimeIndex / 100)
    );
    const riskCat = robberyRisk > 75 ? 'HIGH' : robberyRisk > 40 ? 'MODERATE' : 'LOW';

    // Release probability
    const releaseProb = inp.ustAgeYears / 100 * inp.spillEventsPerYear * 0.01;
    const releaseCost = inp.monthlyVolumeGal * 0.01 * 150; // ~1% of monthly = worst case

    // Oil/water separator
    const separatorSize = inp.stormwaterFlowRateGpm * 15; // 15-min detention

    // Vapor recovery
    const vaporRecovered = inp.stageIIVaporRecovery ?
        inp.monthlyVolumeGal * 12 * 0.006 * 6.0 / 2000 : 0; // ~0.6% loss avoided, 6 lb/gal

    // Overall HSE score
    const overallHSE = (
        25 * (nfpaScore / 100) +
        15 * (shutoffCoverage / 100) +
        15 * Math.max(0, 1 - trir / 5) +
        10 * (1 - robberyRisk / 100) +
        15 * (inp.ustComplianceScore / 100) +
        10 * (inp.stageIIVaporRecovery ? 1 : 0.5) +
        10 * (inp.spillEventsPerYear < 1 ? 1 : 0)
    ) * 100 / 100;

    return {
        nfpa30aComplianceScore: nfpaScore,
        emergencyShutoffCoveragePct: shutoffCoverage,
        trir,
        dart,
        robberyRiskIndex: robberyRisk,
        robberyRiskCategory: riskCat,
        releaseProbability: releaseProb,
        releaseCostEstimate: releaseCost,
        oilWaterSeparatorSizeGal: separatorSize,
        vaporRecoveredTonsPerYear: vaporRecovered,
        safetyTrainingCompliancePct: 85 + Math.random() * 15,
        overallHSEScore: overallHSE
    };
}

// ══════════════════════════════════════════════════════════════
// 8.10 — ENERGY TRANSITION & FUTURE OF FUEL RETAIL
// ══════════════════════════════════════════════════════════════

export interface EnergyTransitionInputs {
    currentYear: number;
    regionEVAdoptionRate: number;          // % new car sales
    currentFuelVolumeGalPerYear: number;
    fleetTurnoverYears: number;
    iceToEVTransitionRate: number;        // Bass diffusion parameter
    totalStationsInMarket: number;
    stationRankByProfit: number;          // where this station ranks (1 = most profitable)
    // Hydrogen
    hydrogenStationCapexMM: number;
    hydrogenUtilizationPct: number;
    hydrogenPricePerKg: number;
    hydrogenDemandKgPerDay: number;
    // Solar + Battery
    solarCanopyKW: number;
    batteryStorageKWH: number;
    solarIrradianceKwhPerM2PerDay: number;
    peakShavingSavingsPct: number;
    demandChargeSavingsPerMonth: number;
    // Multi-energy
    multiEnergyModel: boolean;
    autonomousVehiclePct: number;
    autonomousRefuelingEfficiencyPct: number;
}

export interface EnergyTransitionResult {
    evAdoptionCurve: { year: number; evPct: number }[];
    fuelDemandDecline: { year: number; gallons: number }[];
    stationCountProjection: { year: number; count: number }[];
    yearFuelDemandHalves: number;
    hydrogenAnnualRevenue: number;
    hydrogenBreakevenUtilization: number;
    solarNPV: number;
    batteryPaybackYears: number;
    multiEnergyRevenueMix: { fuel: number; ev: number; hydrogen: number; cstore: number };
    transitionRiskScore: number;
    businessModelTransitionIndex: number;
    avFuellingScenario: number;
}

export function projectEnergyTransition(inp: EnergyTransitionInputs): EnergyTransitionResult {
    // Bass diffusion model for EV adoption
    const p = 0.03; // innovation coefficient
    const q = 0.38; // imitation coefficient
    const evCurve: { year: number; evPct: number }[] = [];
    let cumulative = inp.regionEVAdoptionRate / 100;
    for (let t = 0; t <= 25; t++) {
        const adoption = (p + q * cumulative) * (1 - cumulative);
        cumulative += adoption;
        evCurve.push({ year: inp.currentYear + t, evPct: Math.min(100, cumulative * 100) });
    }

    // Fuel demand decline (linked to EV adoption)
    const declineCurve: { year: number; gallons: number }[] = [];
    let currentGallons = inp.currentFuelVolumeGalPerYear;
    for (let t = 0; t <= 25; t++) {
        const evPct = evCurve[t]?.evPct || 0;
        const factor = Math.max(0.05, 1 - (evPct / 100) * 0.85 - t * 0.003);
        currentGallons = inp.currentFuelVolumeGalPerYear * factor;
        declineCurve.push({ year: inp.currentYear + t, gallons: currentGallons });
    }
    const yearHalves = declineCurve.findIndex(d => d.gallons < inp.currentFuelVolumeGalPerYear / 2);

    // Station count projection
    const stationProjection: { year: number; count: number }[] = [];
    for (let t = 0; t <= 25; t++) {
        const evPct = evCurve[t]?.evPct || 0;
        const closureRate = evPct > 50 ? 0.04 + (evPct - 50) * 0.006 : 0.01;
        const count = Math.max(1, Math.round(inp.totalStationsInMarket * Math.exp(-closureRate * t)));
        stationProjection.push({ year: inp.currentYear + t, count });
    }

    // Hydrogen
    const h2DailyRevenue = inp.hydrogenDemandKgPerDay * inp.hydrogenPricePerKg;
    const h2AnnualRevenue = h2DailyRevenue * 365;
    const h2AnnualOpex = inp.hydrogenStationCapexMM * 0.08 * 1e6;
    const h2BreakevenUtil = inp.hydrogenStationCapexMM * 1e6 * 0.15 /
        (365 * inp.hydrogenDemandKgPerDay * inp.hydrogenPricePerKg) * 100;

    // Solar + Battery NPV
    const solarAnnualGen = inp.solarCanopyKW * inp.solarIrradianceKwhPerM2PerDay * 365 * 0.15; // 15% efficiency
    const solarAnnualRevenue = solarAnnualGen * 0.12; // $0.12/kWh avoided cost
    const solarCapex = inp.solarCanopyKW * 1500 + inp.batteryStorageKWH * 400;
    const solarNPV = -solarCapex + solarAnnualRevenue * 9.9; // 10yr PV at 5%
    const batteryPayback = inp.batteryStorageKWH * 400 /
        Math.max(1, inp.demandChargeSavingsPerMonth * 12 + solarAnnualGen * 0.05);

    // Multi-energy revenue mix
    const fuelRevBase = inp.currentFuelVolumeGalPerYear * 3.50;
    const evRevBase = 500000;
    const h2RevBase = h2AnnualRevenue;
    const cstoreRevBase = 1200000;
    const totalMultiRev = fuelRevBase * 0.5 + evRevBase + h2RevBase + cstoreRevBase;
    const revenueMix = {
        fuel: (fuelRevBase * 0.5 / totalMultiRev) * 100,
        ev: (evRevBase / totalMultiRev) * 100,
        hydrogen: (h2RevBase / totalMultiRev) * 100,
        cstore: (cstoreRevBase / totalMultiRev) * 100
    };

    // Transition risk
    const transitionRisk = Math.min(100, Math.max(0,
        30 * (inp.currentFuelVolumeGalPerYear / 1e7) +
        25 * (yearHalves > 15 ? 0 : (15 - yearHalves) / 15 * 100) +
        25 * (1 - inp.stationRankByProfit / inp.totalStationsInMarket) * 100 +
        20 * (inp.multiEnergyModel ? 0 : 50)
    ));

    // Business model transition index
    const bmTransition = Math.min(100,
        40 * (inp.multiEnergyModel ? 1 : 0.3) +
        20 * (inp.solarCanopyKW / 500) +
        20 * (inp.batteryStorageKWH / 1000) +
        20 * (inp.hydrogenDemandKgPerDay / 500)
        * 100);

    // AV fuelling scenario
    const avFuelling = inp.currentFuelVolumeGalPerYear *
        (inp.autonomousVehiclePct / 100) *
        (inp.autonomousRefuelingEfficiencyPct / 100);

    return {
        evAdoptionCurve: evCurve,
        fuelDemandDecline: declineCurve,
        stationCountProjection: stationProjection,
        yearFuelDemandHalves: inp.currentYear + (yearHalves > 0 ? yearHalves : 25),
        hydrogenAnnualRevenue: h2AnnualRevenue,
        hydrogenBreakevenUtilization: h2BreakevenUtil,
        solarNPV,
        batteryPaybackYears: batteryPayback,
        multiEnergyRevenueMix: revenueMix,
        transitionRiskScore: transitionRisk,
        businessModelTransitionIndex: bmTransition,
        avFuellingScenario: avFuelling
    };
}

// ══════════════════════════════════════════════════════════════
// 8.10B — EV CHARGER ECONOMICS CALCULATOR
// ══════════════════════════════════════════════════════════════

export interface EvChargerInputs {
    dcfcChargerCount: number;
    dcfcChargerPowerKW: number;           // rated power per charger (150-350 kW)
    dcfcChargerCapexPerUnit: number;      // $ per unit hardware
    installCostPerCharger: number;        // electrical/construction per charger
    electricalInfraCapex: number;         // transformer, switchgear, conduit
    demandChargePerKwPerMonth: number;    // utility demand charge $/kW-mo
    utilizationRatePct: number;           // % of hours charger is in use
    avgSessionDurationMin: number;        // avg EV charging session
    pricePerKwh: number;                  // retail price to customer
    electricityCostPerKwh: number;        // wholesale electricity rate
    networkFeePct: number;                // ChargePoint/EVgo/Shell Recharge fee %
    annualMaintenancePerCharger: number;
    projectLifeYears: number;
    discountRatePct: number;
}

export interface EvChargerResult {
    sessionsPerDay: number;
    kwhPerDay: number;
    kwhPerYear: number;
    annualRevenue: number;
    annualElectricityCost: number;
    annualNetworkFees: number;
    annualDemandCharges: number;
    annualMaintenance: number;
    totalAnnualOpex: number;
    annualNetProfit: number;
    totalCapex: number;
    simplePaybackYears: number;
    npv: number;
    irrApprox: number;
    breakEvenUtilizationPct: number;
    revenuePerSession: number;
    costPerSession: number;
    marginPerSession: number;
    levelizedCostPerKwh: number;
}

export function calculateEvChargerEconomics(inp: EvChargerInputs): EvChargerResult {
    const maxSessionsPerDay = (24 * 60) / inp.avgSessionDurationMin;
    const sessionsPerDay = (inp.utilizationRatePct / 100) * maxSessionsPerDay * inp.dcfcChargerCount;
    const kwhPerSession = inp.dcfcChargerPowerKW * (inp.avgSessionDurationMin / 60);
    const kwhPerDay = sessionsPerDay * kwhPerSession;
    const kwhPerYear = kwhPerDay * 365;

    const annualRevenue = kwhPerYear * inp.pricePerKwh;
    const annualElectricityCost = kwhPerYear * inp.electricityCostPerKwh;
    const annualNetworkFees = annualRevenue * (inp.networkFeePct / 100);
    const annualDemandCharges = inp.dcfcChargerCount * inp.dcfcChargerPowerKW *
        inp.demandChargePerKwPerMonth * 12 * Math.sqrt(inp.utilizationRatePct / 100);
    const annualMaintenance = inp.dcfcChargerCount * inp.annualMaintenancePerCharger;
    const totalAnnualOpex = annualElectricityCost + annualNetworkFees + annualDemandCharges + annualMaintenance;
    const annualNetProfit = annualRevenue - totalAnnualOpex;

    const totalCapex = inp.dcfcChargerCount * (inp.dcfcChargerCapexPerUnit + inp.installCostPerCharger) +
        inp.electricalInfraCapex;
    const simplePaybackYears = annualNetProfit > 0 ? totalCapex / annualNetProfit : 999;

    // NPV
    const r = inp.discountRatePct / 100;
    let npv = -totalCapex;
    for (let y = 1; y <= inp.projectLifeYears; y++) {
        npv += annualNetProfit / Math.pow(1 + r, y);
    }

    // IRR approximation (simple)
    const irrApprox = annualNetProfit > 0 && totalCapex > 0 ? (annualNetProfit / totalCapex) * 100 : 0;

    // Break-even utilization
    const fixedCosts = annualDemandCharges + annualMaintenance + annualNetworkFees * 0.5;
    const marginPerKwh = inp.pricePerKwh - inp.electricityCostPerKwh - inp.pricePerKwh * (inp.networkFeePct / 100);
    const breakevenKwh = marginPerKwh > 0 ? fixedCosts / marginPerKwh : 999999;
    const maxPossibleKwh = inp.dcfcChargerCount * inp.dcfcChargerPowerKW * 24 * 365;
    const breakEvenUtilizationPct = maxPossibleKwh > 0 ? (breakevenKwh / maxPossibleKwh) * 100 : 100;

    const revenuePerSession = kwhPerSession * inp.pricePerKwh;
    const costPerSession = totalAnnualOpex / Math.max(1, sessionsPerDay * 365);
    const marginPerSession = revenuePerSession - costPerSession;
    const levelizedCostPerKwh = kwhPerYear > 0 ? totalAnnualOpex / kwhPerYear : 0;

    return {
        sessionsPerDay, kwhPerDay, kwhPerYear, annualRevenue,
        annualElectricityCost, annualNetworkFees, annualDemandCharges,
        annualMaintenance, totalAnnualOpex, annualNetProfit, totalCapex,
        simplePaybackYears, npv, irrApprox, breakEvenUtilizationPct,
        revenuePerSession, costPerSession, marginPerSession, levelizedCostPerKwh
    };
}

// ══════════════════════════════════════════════════════════════
// 8.10C — HYDROGEN FUELING STATION DETAILED ECONOMICS
// ══════════════════════════════════════════════════════════════

export interface HydrogenStationInputs {
    stationCapexMM: number;                // total capex $2-5M typical
    dailyCapacityKgH2: number;            // kg H₂ per day design capacity
    utilizationPct: number;               // % of capacity utilized
    pricePerKg: number;                    // retail H₂ price $/kg
    electricityCostPerKwh: number;         // for compression
    compressionKwhPerKg: number;           // ~5-10 kWh/kg for 700 bar
    storageCascadeCount: number;           // number of cascade banks
    cascadePressureBar: number;            // 350 or 700 bar dispensing
    annualOpexPctOfCapex: number;         // % of capex for annual opex
    fleetFuelCellVehiclesPerDay: number;   // avg FCEVs refueling daily
    kgPerVehiclePerFill: number;           // ~5-6 kg per FCEV fill
    gasolineEquivalentPricePerGal: number; // for comparison
}

export interface HydrogenStationResult {
    annualKgDelivered: number;
    annualRevenue: number;
    annualElectricityCost: number;
    annualOpex: number;
    annualNetProfit: number;
    costPerKgDelivered: number;
    breakEvenUtilizationPct: number;
    dailyVehiclesServed: number;
    capacityUtilizationPct: number;
    h2PerGge: number;                      // kg H₂ per gasoline gallon equivalent
    costPerGge: number;                    // $/GGE for comparison with gasoline
    compressionEnergyCostPerKg: number;
    stationThroughputKgPerDay: number;
    simplePaybackYears: number;
    irrApprox: number;
}

export function calculateHydrogenStation(inp: HydrogenStationInputs): HydrogenStationResult {
    const dailyKgDelivered = inp.dailyCapacityKgH2 * (inp.utilizationPct / 100);
    const annualKgDelivered = dailyKgDelivered * 365;
    const annualRevenue = annualKgDelivered * inp.pricePerKg;

    const compressionEnergyCostPerKg = inp.compressionKwhPerKg * inp.electricityCostPerKwh;
    const annualElectricityCost = compressionEnergyCostPerKg * annualKgDelivered;
    const annualOpex = inp.stationCapexMM * 1e6 * (inp.annualOpexPctOfCapex / 100);
    const totalAnnualCost = annualElectricityCost + annualOpex;
    const annualNetProfit = annualRevenue - totalAnnualCost;

    const costPerKgDelivered = annualKgDelivered > 0 ? totalAnnualCost / annualKgDelivered : 0;

    // Break-even utilization
    const fcPerKg = costPerKgDelivered > 0 ? inp.pricePerKg / costPerKgDelivered : 2;
    const breakEvenUtilizationPct = fcPerKg > 1 ? (inp.utilizationPct / fcPerKg) : inp.utilizationPct;

    const dailyVehiclesServed = inp.kgPerVehiclePerFill > 0 ? dailyKgDelivered / inp.kgPerVehiclePerFill : 0;
    const capacityUtilizationPct = (dailyVehiclesServed / Math.max(1, inp.fleetFuelCellVehiclesPerDay)) * 100;

    // Hydrogen to GGE conversion: 1 kg H₂ ≈ 1 GGE (gasoline gallon equivalent energy)
    const h2PerGge = 1.0;
    const costPerGge = costPerKgDelivered * h2PerGge;

    const simplePaybackYears = annualNetProfit > 0 ? (inp.stationCapexMM * 1e6) / annualNetProfit : 999;
    const irrApprox = annualNetProfit > 0 ? (annualNetProfit / (inp.stationCapexMM * 1e6)) * 100 : 0;

    return {
        annualKgDelivered,
        annualRevenue,
        annualElectricityCost,
        annualOpex,
        annualNetProfit,
        costPerKgDelivered,
        breakEvenUtilizationPct,
        dailyVehiclesServed,
        capacityUtilizationPct,
        h2PerGge,
        costPerGge,
        compressionEnergyCostPerKg,
        stationThroughputKgPerDay: dailyKgDelivered,
        simplePaybackYears,
        irrApprox
    };
}

// ══════════════════════════════════════════════════════════════
// COMPREHENSIVE RETAIL SIMULATION
// ══════════════════════════════════════════════════════════════

export interface RetailConfig {
    // Site
    adtVehiclesPerDay: number;
    captureRatePct: number;
    populationRadius5Mi: number;
    medianHouseholdIncome: number;
    competingStations: number;
    // UST
    totalCapacityGallons: number;
    tankAgeYears: number;
    expectedTankLifeYears: number;
    // Dispensing
    numDispensers: number;
    designFlowRateGpm: number;
    monthlyVolumeGal: number;
    // Pricing
    rackWholesalePerGal: number;
    targetMarginPerGal: number;
    federalTaxPerGal: number;
    stateTaxPerGal: number;
    // Operations
    employeesPerShift: number;
    shiftsPerDay: number;
    // C-Store
    insideConversionPct: number;
    avgInsideBasketSize: number;
    insideGrossMarginPct: number;
    // Ancillary
    carWashCarsPerHour: number;
    carWashTicketPrice: number;
    evChargerCount: number;
    // Energy transition
    evAdoptionRate: number;
    multiEnergyModel: boolean;
    // Economics
    crudeCostPerBbl: number;
    discountRatePct: number;
    projectLifeYears: number;
}

export interface RetailSimResult {
    siteSelection: SiteSelectionResult;
    ust: USTResult;
    dispenser: DispenserResult;
    pricing: PricingResult;
    operations: OperationsResult;
    cstore: CStoreResult;
    ancillary: CarWashResult;
    hse: RetailHSEResult;
    energyTransition: EnergyTransitionResult;
    totalMonthlyRevenue: number;
    totalMonthlyMargin: number;
    totalAnnualRevenue: number;
    totalAnnualMargin: number;
    npv10yr: number;
    irrApprox: number;
    stationValuation: number;
}

export function runRetailSimulation(config: RetailConfig): RetailSimResult {
    const gallonsPerMonth = config.monthlyVolumeGal;
    const gallonsPerYear = gallonsPerMonth * 12;
    const fuelCustomers = gallonsPerMonth / 12; // avg 12 gal per fill

    // 8.1 Site Selection
    const site = calculateSiteSelection({
        adtVehiclesPerDay: config.adtVehiclesPerDay,
        trafficGrowthRatePct: 2,
        captureRatePct: config.captureRatePct,
        avgGallonsPerFill: 12,
        populationRadius5Mi: config.populationRadius5Mi,
        medianHouseholdIncome: config.medianHouseholdIncome,
        avgCommuteMinutes: 28,
        competingStations: config.competingStations,
        landAcres: 2.5,
        landCostPerAcre: 500000,
        constructionCostMM: 1.2,
        equipmentCostMM: 0.8,
        fuelMarginPerGal: config.targetMarginPerGal,
        discountRatePct: config.discountRatePct,
        projectLifeYears: config.projectLifeYears,
        businessModel: 'coco'
    });

    // 8.2 UST
    const ust = analyzeUSTSystem({
        totalCapacityGallons: config.totalCapacityGallons,
        numTanks: 3,
        numCompartments: 4,
        tankDiameterFt: 8,
        tankLengthFt: 35,
        tankWallThicknessIn: 0.25,
        tankMaterialDensityLbPerFt3: 490,
        groundwaterDepthFt: 15,
        soilDensityLbPerFt3: 120,
        monthlyThroughputGal: gallonsPerMonth,
        leakDetectionThresholdGph: 0.1,
        interstitialMonitoring: true,
        sirConfidenceLevelPct: 95,
        cpCurrentDensityMaPerFt2: 1.5,
        steelSurfaceAreaFt2: 1200,
        remediationCostPerFt3: 125,
        cleanupCostPerGallonSpilled: 150,
        financialAssuranceMM: 2.5,
        tankAgeYears: config.tankAgeYears,
        expectedTankLifeYears: config.expectedTankLifeYears
    });

    // 8.3 Dispensing
    const dispenser = analyzeDispenserSystem({
        numDispensers: config.numDispensers,
        numHosesPerDispenser: 2,
        designFlowRateGpm: config.designFlowRateGpm,
        hoseDiameterIn: 0.75,
        hoseLengthFt: 12,
        meterTolerancePct: 0.3,
        monthlyVolumeGal: gallonsPerMonth,
        ambientTempF: 72,
        productApiGravity: 58,
        dispenserCapexPerUnit: 18000,
        stpCapex: 25000,
        annualMaintenancePerDispenser: 1200,
        electricityCostPerKWh: 0.12,
        stpMotorHP: 5
    });

    // 8.5 Pricing
    const pricing = optimizePricingStrategy({
        crudeCostPerBbl: config.crudeCostPerBbl,
        rackWholesalePerGal: config.rackWholesalePerGal,
        federalTaxPerGal: config.federalTaxPerGal,
        stateTaxPerGal: config.stateTaxPerGal,
        deliveryCostPerGal: 0.03,
        targetMarginPerGal: config.targetMarginPerGal,
        competitorPricePerGal: config.rackWholesalePerGal + config.federalTaxPerGal + config.stateTaxPerGal + config.targetMarginPerGal - 0.02,
        priceGapToCompetitor: -0.02,
        priceElasticity: 3.5,
        baseVolumePerMonth: gallonsPerMonth,
        premiumPriceGap: 0.40,
        midGradePriceGap: 0.15,
        regularSharePct: 75,
        midGradeSharePct: 10,
        premiumSharePct: 15,
        brandedPremiumPct: 5,
        hypermarketDisruptionPct: 8
    });

    // 8.6 Operations
    const operations = analyzeStationOperations({
        monthlyGallonsSold: gallonsPerMonth,
        avgTransactionGal: 12,
        employeesPerShift: config.employeesPerShift,
        shiftsPerDay: config.shiftsPerDay,
        hourlyWage: 16,
        monthlyFixedCosts: 18000,
        deliveriesPerMonth: 12,
        avgDeliveryGal: 8500,
        atgReconciliationVariancePct: 0.15,
        dispenserAgeYears: 5,
        dispenserLifeYears: 15,
        ustAgeYears: config.tankAgeYears,
        ustLifeYears: config.expectedTankLifeYears,
        stpAgeYears: 5,
        stpLifeYears: 20,
        canopyAgeYears: 10,
        canopyLifeYears: 30,
        workOrderBacklog: 8,
        criticalWO: 1,
        hseWO: 2
    });

    // 8.7 C-Store
    const cstore = analyzeCStore({
        monthlyFuelGal: gallonsPerMonth,
        fuelCustomersPerMonth: fuelCustomers,
        insideConversionPct: config.insideConversionPct,
        avgInsideBasketSize: config.avgInsideBasketSize,
        insideGrossMarginPct: config.insideGrossMarginPct,
        cstoreSqFt: 3200,
        packagedBeverageSales: gallonsPerMonth * 0.3,
        snacksSales: gallonsPerMonth * 0.15,
        tobaccoSales: gallonsPerMonth * 0.22,
        beerSales: gallonsPerMonth * 0.18,
        candySales: gallonsPerMonth * 0.05,
        foodServiceSales: gallonsPerMonth * 0.08,
        generalMdseSales: gallonsPerMonth * 0.02,
        bevMarginPct: 38,
        snackMarginPct: 42,
        tobaccoMarginPct: 18,
        beerMarginPct: 28,
        candyMarginPct: 55,
        foodServiceMarginPct: 60,
        generalMarginPct: 45,
        loyaltyDiscountPerGal: 0.05,
        loyaltyInsideLiftPct: 8,
        loyaltyMemberCount: 500
    });

    // 8.8 Ancillary
    const ancillary = analyzeAncillaryServices({
        washType: 'iba',
        carsPerHour: config.carWashCarsPerHour,
        operatingHoursPerDay: 14,
        daysPerMonth: 30,
        averageTicketPrice: config.carWashTicketPrice,
        variableCostPerWash: 1.20,
        fixedCostPerMonth: 8000,
        membershipPricePerMonth: 29.99,
        memberCount: 200,
        avgMemberWashesPerMonth: 6,
        numEVChargers: config.evChargerCount,
        chargerCapexPerStall: 150000,
        chargerUtilizationPct: 15,
        chargingPricePerKWh: 0.45,
        demandChargePerMonth: 350,
        avgKwhPerSession: 45,
        waterReclaimSystemEfficiency: 0.70,
        waterCostPer1kGal: 4.50,
        gallonsPerWash: 45,
        propaneExchangesPerMonth: 80,
        propaneRevenuePerExchange: 22,
        propaneCostPerExchange: 14
    });

    // 8.9 HSE
    const hse = evaluateRetailHSE({
        monthlyVolumeGal: gallonsPerMonth,
        numDispensers: config.numDispensers,
        ustAgeYears: config.tankAgeYears,
        ustComplianceScore: ust.complianceScorePct,
        cashHandlingVolume: 2500,
        hoursOfDarknessPerDay: 10,
        neighborhoodCrimeIndex: 35,
        totalEmployees: config.employeesPerShift * config.shiftsPerDay,
        annualWorkHours: config.employeesPerShift * config.shiftsPerDay * 2000,
        recordableIncidents: 1,
        lostTimeIncidents: 0,
        spillEventsPerYear: 0,
        stormwaterFlowRateGpm: 25,
        stageIIVaporRecovery: true,
        fireSuppressionTested: true,
        emergencyShutoffDistanceFt: 80
    });

    // 8.10 Energy Transition
    const energyTransition = projectEnergyTransition({
        currentYear: 2026,
        regionEVAdoptionRate: config.evAdoptionRate,
        currentFuelVolumeGalPerYear: gallonsPerYear,
        fleetTurnoverYears: 12,
        iceToEVTransitionRate: 0.05,
        totalStationsInMarket: 50,
        stationRankByProfit: 15,
        hydrogenStationCapexMM: 3.5,
        hydrogenUtilizationPct: 25,
        hydrogenPricePerKg: 16,
        hydrogenDemandKgPerDay: 200,
        solarCanopyKW: 150,
        batteryStorageKWH: 500,
        solarIrradianceKwhPerM2PerDay: 4.8,
        peakShavingSavingsPct: 20,
        demandChargeSavingsPerMonth: 1200,
        multiEnergyModel: config.multiEnergyModel,
        autonomousVehiclePct: 15,
        autonomousRefuelingEfficiencyPct: 85
    });

    // Financial summary
    const fuelRevenue = gallonsPerMonth * pricing.pumpPricePerGal;
    const totalMonthlyRevenue = fuelRevenue + cstore.insideSalesPerMonth +
        ancillary.washRevenuePerMonth + ancillary.membershipMRR + ancillary.evRevenuePerMonth;
    const totalMonthlyMargin = gallonsPerMonth * (pricing.pumpPricePerGal -
        (config.rackWholesalePerGal + config.federalTaxPerGal + config.stateTaxPerGal + 0.03)) +
        cstore.insideMarginPerMonth + ancillary.totalAncillaryMargin;

    const annualRevenue = totalMonthlyRevenue * 12;
    const annualMargin = totalMonthlyMargin * 12;

    // NPV
    let npv = -site.totalCapex;
    const r = config.discountRatePct / 100;
    for (let t = 1; t <= config.projectLifeYears; t++) {
        npv += annualMargin / ((1 + r) ** t);
    }

    // Approximate IRR
    const irrApprox = (annualMargin / site.totalCapex) * 100;

    // Station valuation (5x EBITDA multiple proxy)
    const stationValuation = annualMargin * 5.5;

    return {
        siteSelection: site,
        ust,
        dispenser,
        pricing,
        operations,
        cstore,
        ancillary,
        hse,
        energyTransition,
        totalMonthlyRevenue,
        totalMonthlyMargin,
        totalAnnualRevenue: annualRevenue,
        totalAnnualMargin: annualMargin,
        npv10yr: npv,
        irrApprox,
        stationValuation
    };
}