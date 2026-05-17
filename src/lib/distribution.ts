/**
 * Phase 7: Product Distribution & Logistics — Calculation Engine
 * Complex downstream logistics calculations for industrial engineers,
 * petroleum consultancies, and university students.
 * All calculations handle full industrial-scale values (billions).
 */

// ───────────────────────────────────────────────────────────────
// 7.1 NETWORK PLANNING & SUPPLY CHAIN OPTIMIZATION
// ───────────────────────────────────────────────────────────────

/** Total delivered cost per unit volume (all cost components) */
export function totalDeliveredCost(
    productCostPerBbl: number,
    pipelineTariffPerBbl: number,
    terminalFeePerBbl: number,
    truckFreightPerBbl: number,
    storageCostPerBbl: number,
    inventoryCarryingCostPerBbl: number
): number {
    return productCostPerBbl + pipelineTariffPerBbl + terminalFeePerBbl +
        truckFreightPerBbl + storageCostPerBbl + inventoryCarryingCostPerBbl;
}

/** Safety stock calculation (basic probabilistic model) */
export function safetyStock(
    avgDailyDemandBpd: number,
    leadTimeDays: number,
    demandStdDevBpd: number,
    serviceLevelZ: number // e.g., 1.645 for 95%
): number {
    return serviceLevelZ * demandStdDevBpd * Math.sqrt(leadTimeDays);
}

/** Days of cover / forward coverage */
export function daysOfCover(totalInventoryBbl: number, avgDailyDemandBpd: number): number {
    if (avgDailyDemandBpd <= 0) return 0;
    return totalInventoryBbl / avgDailyDemandBpd;
}

/** Reorder point (ROP) */
export function reorderPoint(
    avgDailyDemandBpd: number,
    leadTimeDays: number,
    safetyStockBbl: number
): number {
    return avgDailyDemandBpd * leadTimeDays + safetyStockBbl;
}

/** MILP-style network total logistics cost (simplified) */
export function networkTotalCost(
    lanes: { origin: string; dest: string; volumeBpd: number; ratePerBbl: number; distanceMiles: number }[],
    fixedCostPerDay: number = 0
): { totalVariableCost: number; totalFixedCost: number; avgRatePerBbl: number; totalVolumeBpd: number } {
    const totalVol = lanes.reduce((s, l) => s + l.volumeBpd, 0);
    const varCost = lanes.reduce((s, l) => s + l.volumeBpd * l.ratePerBbl, 0);
    return {
        totalVariableCost: varCost,
        totalFixedCost: fixedCostPerDay,
        avgRatePerBbl: totalVol > 0 ? varCost / totalVol : 0,
        totalVolumeBpd: totalVol
    };
}

/** Seasonal demand index (normalized) */
export function seasonalDemandIndex(
    month: number, // 1-12
    baseDemandBpd: number,
    seasonalAmplitudePct: number
): number {
    const seasonalFactor = 1 + seasonalAmplitudePct / 100 * Math.sin((month - 3) * Math.PI / 6);
    return baseDemandBpd * seasonalFactor;
}

/** Demand forecast mean absolute error */
export function forecastMAE(actualValues: number[], forecastValues: number[]): number {
    const n = Math.min(actualValues.length, forecastValues.length);
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(actualValues[i] - forecastValues[i]);
    return sum / n;
}

/** Forecast bias */
export function forecastBias(actualValues: number[], forecastValues: number[]): number {
    const n = Math.min(actualValues.length, forecastValues.length);
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += forecastValues[i] - actualValues[i];
    return sum / n;
}

/** Hub-and-spoke cost efficiency ratio */
export function hubSpokeEfficiency(
    directCostPerBbl: number,
    hubSpokeCostPerBbl: number
): number {
    if (directCostPerBbl <= 0) return 0;
    return (1 - hubSpokeCostPerBbl / directCostPerBbl) * 100;
}

/** Pipeline capacity utilization */
export function networkUtilization(actualThroughputBpd: number, designCapacityBpd: number): number {
    if (designCapacityBpd <= 0) return 0;
    return (actualThroughputBpd / designCapacityBpd) * 100;
}

// ───────────────────────────────────────────────────────────────
// 7.2 PRODUCT PIPELINES
// ───────────────────────────────────────────────────────────────

/** Batch size required for a product */
export function batchSizeRequired(
    demandVolumeBbl: number,
    cycleDays: number,
    safetyFactor: number
): number {
    return demandVolumeBbl * cycleDays * (1 + safetyFactor);
}

/** Transmix volume between product batches */
export function transmixVolume(
    pipelineDiameterIn: number,
    lengthMiles: number,
    reynoldsNumber: number
): number {
    // Transmix grows with pipe volume and interface length
    const crossSectionFt2 = Math.PI * Math.pow(pipelineDiameterIn / 12, 2) / 4;
    const pipeVolBbl = crossSectionFt2 * lengthMiles * 5280 / 5.615;
    const interfaceFraction = 0.001 + (reynoldsNumber > 100000 ? 0.0005 : 0.002);
    return pipeVolBbl * interfaceFraction * 2; // Two interfaces per batch
}

/** Interface length between product batches (Austin-Palfrey correlation simplified) */
export function interfaceLengthFeet(
    pipelineDiameterIn: number,
    reynoldsNumber: number,
    schmidtNumber: number
): number {
    // Empirical interface growth
    const L_over_D = 185 * Math.pow(reynoldsNumber, -0.1) * Math.pow(schmidtNumber, 0.4);
    return L_over_D * pipelineDiameterIn / 12;
}

/** Pipeline transit time */
export function pipelineTransitTimeHours(
    distanceMiles: number,
    flowRateBpd: number,
    pipelineDiameterIn: number
): number {
    const crossFt2 = Math.PI * Math.pow(pipelineDiameterIn / 12, 2) / 4;
    const volumeBbl = crossFt2 * distanceMiles * 5280 / 5.615;
    if (flowRateBpd <= 0) return 0;
    return volumeBbl / flowRateBpd * 24;
}

/** Pipeline linefill volume */
export function pipelineLinefill(
    diameterIn: number,
    lengthMiles: number
): number {
    const crossFt2 = Math.PI * Math.pow(diameterIn / 12, 2) / 4;
    return crossFt2 * lengthMiles * 5280 / 5.615;
}

/** Batch cycle time (days between successive batches of same product) */
export function batchCycleDays(
    pipelineLinefillBbl: number,
    throughputBpd: number,
    numProducts: number
): number {
    if (throughputBpd <= 0) return 0;
    return (pipelineLinefillBbl * numProducts) / throughputBpd;
}

/** Pipeline revenue per barrel */
export function pipelineRevenuePerBbl(
    tariffPerBbl: number,
    throughputBpd: number
): number {
    return tariffPerBbl * throughputBpd;
}

/** Pipeline utilization rate */
export function pipelineUtilization(actualBpd: number, nameplateBpd: number): number {
    if (nameplateBpd <= 0) return 0;
    return (actualBpd / nameplateBpd) * 100;
}

/** Product sequence compatibility check (adjacent batches) */
export function sequenceCompatibility(
    productA: 'gasoline' | 'diesel' | 'jet' | 'fuelOil' | 'naphtha' | 'ethanol',
    productB: 'gasoline' | 'diesel' | 'jet' | 'fuelOil' | 'naphtha' | 'ethanol'
): { compatible: boolean; riskLevel: number; action: string } {
    const compatMatrix: Record<string, Record<string, number>> = {
        gasoline: { gasoline: 1, diesel: 0.4, jet: 0.3, fuelOil: 0.1, naphtha: 0.8, ethanol: 0.7 },
        diesel: { gasoline: 0.4, diesel: 1, jet: 0.75, fuelOil: 0.5, naphtha: 0.3, ethanol: 0.1 },
        jet: { gasoline: 0.3, diesel: 0.75, jet: 1, fuelOil: 0.4, naphtha: 0.2, ethanol: 0.05 },
        fuelOil: { gasoline: 0.1, diesel: 0.5, jet: 0.4, fuelOil: 1, naphtha: 0.2, ethanol: 0.05 },
        naphtha: { gasoline: 0.8, diesel: 0.3, jet: 0.2, fuelOil: 0.2, naphtha: 1, ethanol: 0.6 },
        ethanol: { gasoline: 0.7, diesel: 0.1, jet: 0.05, fuelOil: 0.05, naphtha: 0.6, ethanol: 1 },
    };
    const score = compatMatrix[productA]?.[productB] ?? 0;
    return {
        compatible: score >= 0.5,
        riskLevel: Math.round((1 - score) * 100),
        action: score >= 0.8 ? 'Direct sequence OK' :
            score >= 0.5 ? 'Minimize interface, monitor gravity' :
                score >= 0.3 ? 'Insert buffer batch or segment' : 'Must separate with buffer'
    };
}

/** Gravity-based interface detector trigger (API difference) */
export function interfaceDetectorDelta(
    apiGravity1: number,
    apiGravity2: number
): number {
    return Math.abs(apiGravity1 - apiGravity2);
}

// ───────────────────────────────────────────────────────────────
// 7.3 MARINE DISTRIBUTION
// ───────────────────────────────────────────────────────────────

/** Voyage time (round trip) */
export function voyageTimeDays(
    distanceNauticalMiles: number,
    speedKnots: number,
    portTimeDays: number
): number {
    if (speedKnots <= 0) return 0;
    return (distanceNauticalMiles / speedKnots / 24) * 2 + portTimeDays;
}

/** Freight cost per barrel (Worldscale-based simplified) */
export function freightCostPerBbl(
    worldscaleFlatRate: number,
    wsPercentage: number,
    cargoSizeBbl: number
): number {
    if (cargoSizeBbl <= 0) return 0;
    return (worldscaleFlatRate * wsPercentage / 100) / cargoSizeBbl;
}

/** Total voyage cost */
export function totalVoyageCost(
    charterRatePerDay: number,
    voyageDays: number,
    portCharges: number,
    canalFees: number,
    bunkerCost: number
): number {
    return charterRatePerDay * voyageDays + portCharges + canalFees + bunkerCost;
}

/** Demurrage cost (laytime exceeded) */
export function demurrageCost(
    demurrageRatePerDay: number,
    excessDays: number
): number {
    return Math.max(0, demurrageRatePerDay * excessDays);
}

/** Fleet utilization */
export function fleetUtilization(
    totalVesselDays: number,
    operatingDays: number
): number {
    if (totalVesselDays <= 0) return 0;
    return (operatingDays / totalVesselDays) * 100;
}

/** Barge tow capacity */
export function bargeTowCapacity(
    bargeCapacityBbl: number,
    numBarges: number
): number {
    return bargeCapacityBbl * numBarges;
}

/** STS (Ship-to-Ship) lightering transfer rate */
export function lighteringTransferRate(
    hoseDiameterIn: number,
    pumpingRateBph: number
): number {
    return pumpingRateBph; // barrels per hour
}

/** Cargo tank washing time */
export function tankWashingTimeHours(
    tankVolumeBbl: number,
    washWaterRateGpm: number,
    numCycles: number
): number {
    if (washWaterRateGpm <= 0) return 0;
    const waterBblPerHr = washWaterRateGpm * 60 / 42;
    return (tankVolumeBbl * 0.05 / waterBblPerHr) * numCycles;
}

/** Cargo heating energy (for heavy products) */
export function cargoHeatingEnergyMMBtu(
    cargoBbl: number,
    apiGravity: number,
    deltaTempF: number
): number {
    const sg = 141.5 / (apiGravity + 131.5);
    const massLb = cargoBbl * 42 * sg * 8.33;
    const cp = 0.45; // Btu/lb-F for heavy oil
    return (massLb * cp * deltaTempF) / 1e6;
}

/** Max cargo size (vessel constraint) */
export function maxCargoSize(
    vesselDWT: number,
    cargoSg: number,
    loadLineFactor: number
): number {
    const longTonsToBbl = 1 / (cargoSg * 0.1589);
    return vesselDWT * loadLineFactor * longTonsToBbl * 6.29; // Convert to bbl
}

// ───────────────────────────────────────────────────────────────
// 7.4 RAIL DISTRIBUTION
// ───────────────────────────────────────────────────────────────

/** Unit train cost per barrel */
export function unitTrainCostPerBbl(
    leaseRatePerCarPerDay: number,
    transitDaysRoundTrip: number,
    carCapacityBbl: number,
    fuelCostPerTrip: number,
    numCars: number,
    volumeLoadedBbl: number
): number {
    if (volumeLoadedBbl <= 0) return 0;
    const totalLease = leaseRatePerCarPerDay * numCars * transitDaysRoundTrip;
    return (totalLease + fuelCostPerTrip) / volumeLoadedBbl;
}

/** Rail car capacity utilization */
export function railCarCapacity(
    nominalCapacityBbl: number,
    loadFactor: number
): number {
    return nominalCapacityBbl * loadFactor;
}

/** Train cycle days (from loading to return) */
export function trainCycleDays(
    transitDaysOneWay: number,
    loadingDays: number,
    unloadingDays: number,
    inspectionDays: number
): number {
    return transitDaysOneWay * 2 + loadingDays + unloadingDays + inspectionDays;
}

/** Rail fleet size required */
export function railFleetSize(
    dailyVolumeBpd: number,
    carCapacityBbl: number,
    cycleDays: number,
    carsPerTrain: number
): number {
    if (carCapacityBbl <= 0 || carsPerTrain <= 0) return 0;
    const carsNeeded = Math.ceil(dailyVolumeBpd * cycleDays / carCapacityBbl);
    return Math.ceil(carsNeeded / carsPerTrain) * carsPerTrain;
}

/** Rail demurrage charges */
export function railDemurrageCharges(
    demurragePerCarPerDay: number,
    excessDays: number,
    numCars: number
): number {
    return demurragePerCarPerDay * Math.max(0, excessDays) * numCars;
}

/** Railcar loading time per car */
export function loadingTimePerCarMinutes(
    carCapacityBbl: number,
    loadingRateBph: number
): number {
    if (loadingRateBph <= 0) return 0;
    return (carCapacityBbl / loadingRateBph) * 60;
}

/** Railcar unloading time per car */
export function unloadingTimePerCarMinutes(
    carCapacityBbl: number,
    unloadingRateBph: number,
    heatingTimeMin: number
): number {
    if (unloadingRateBph <= 0) return 0;
    return (carCapacityBbl / unloadingRateBph) * 60 + heatingTimeMin;
}

/** Rail vs pipeline cost comparison */
export function railVsPipelineCost(
    railCostPerBbl: number,
    pipelineCostPerBbl: number,
    volumeBpd: number
): { savings: number; preferredMode: string; annualSavings: number } {
    const diff = railCostPerBbl - pipelineCostPerBbl;
    return {
        savings: diff,
        preferredMode: diff > 0 ? 'Pipeline' : diff < 0 ? 'Rail' : 'Equal',
        annualSavings: diff * volumeBpd * 365
    };
}

/** Rail rack throughput capacity */
export function railRackThroughput(
    numLoadingSpots: number,
    loadingRateBph: number,
    operatingHoursPerDay: number
): number {
    return numLoadingSpots * loadingRateBph * operatingHoursPerDay;
}

// ───────────────────────────────────────────────────────────────
// 7.5 TRUCK DISTRIBUTION
// ───────────────────────────────────────────────────────────────

/** Loads per day per lane */
export function loadsPerDayPerLane(
    dailyVolumeGallons: number,
    truckCapacityGallons: number
): number {
    if (truckCapacityGallons <= 0) return 0;
    return dailyVolumeGallons / truckCapacityGallons;
}

/** Delivery cost per gallon */
export function deliveryCostPerGallon(
    truckLeaseCostPerDay: number,
    driverCostPerDay: number,
    fuelCostPerGallon: number,
    milesPerTrip: number,
    mpg: number,
    gallonsPerLoad: number
): number {
    if (gallonsPerLoad <= 0 || mpg <= 0) return 0;
    const fuelCost = fuelCostPerGallon * milesPerTrip / mpg;
    const fixedCost = truckLeaseCostPerDay + driverCostPerDay;
    return (fixedCost + fuelCost) / gallonsPerLoad;
}

/** Route miles per trip */
export function routeMilesPerTrip(
    oneWayMiles: number,
    multiStopDetourMiles: number
): number {
    return oneWayMiles * 2 + multiStopDetourMiles;
}

/** Truck fleet size required */
export function truckFleetSize(
    dailyVolumeGallons: number,
    truckCapacityGallons: number,
    tripsPerDay: number,
    utilizationFactor: number
): number {
    if (truckCapacityGallons <= 0 || tripsPerDay <= 0 || utilizationFactor <= 0) return 0;
    const loadsNeeded = dailyVolumeGallons / truckCapacityGallons;
    return Math.ceil(loadsNeeded / (tripsPerDay * utilizationFactor));
}

/** Truck utilization rate */
export function truckUtilizationRate(
    operatingHoursPerDay: number,
    availableHoursPerDay: number
): number {
    if (availableHoursPerDay <= 0) return 0;
    return (operatingHoursPerDay / availableHoursPerDay) * 100;
}

/** Multi-drop optimization — remaining capacity after drops */
export function multiDropEfficiency(
    initialLoadGallons: number,
    drops: { gallons: number; milesFromPrev: number }[]
): { totalMiles: number; totalDelivered: number; backhaulPct: number } {
    let remaining = initialLoadGallons;
    let totalMiles = 0;
    let totalDelivered = 0;
    for (const drop of drops) {
        const actualDelivery = Math.min(remaining, drop.gallons);
        totalDelivered += actualDelivery;
        remaining -= actualDelivery;
        totalMiles += drop.milesFromPrev;
    }
    return {
        totalMiles,
        totalDelivered,
        backhaulPct: (remaining / initialLoadGallons) * 100
    };
}

/** Hours of service compliance check */
export function hosComplianceCheck(
    drivingHours: number,
    onDutyHours: number,
    offDutyHours: number
): { compliant: boolean; remainingDriveHours: number; remainingDutyHours: number; requiredRestHours: number } {
    const maxDrive = 11;
    const maxDuty = 14;
    const minRest = 10;
    return {
        compliant: drivingHours <= maxDrive && onDutyHours <= maxDuty,
        remainingDriveHours: Math.max(0, maxDrive - drivingHours),
        remainingDutyHours: Math.max(0, maxDuty - onDutyHours),
        requiredRestHours: minRest
    };
}

/** Load optimization factor (weight vs volume) */
export function loadOptimizationEfficiency(
    weightLb: number,
    maxWeightLb: number,
    volumeGal: number,
    maxVolumeGal: number
): number {
    const weightPct = maxWeightLb > 0 ? weightLb / maxWeightLb : 0;
    const volumePct = maxVolumeGal > 0 ? volumeGal / maxVolumeGal : 0;
    return Math.min(1, 1 / Math.max(weightPct, volumePct)) * 100;
}

/** Delivery window compliance */
export function deliveryWindowCompliance(
    scheduledDeliveries: { plannedTime: number; actualTime: number; windowMinutes: number }[]
): number {
    if (scheduledDeliveries.length === 0) return 0;
    let onTime = 0;
    for (const d of scheduledDeliveries) {
        if (Math.abs(d.actualTime - d.plannedTime) <= d.windowMinutes) onTime++;
    }
    return (onTime / scheduledDeliveries.length) * 100;
}

// ───────────────────────────────────────────────────────────────
// 7.6 TERMINAL OPERATIONS
// ───────────────────────────────────────────────────────────────

/** Terminal throughput */
export function terminalThroughput(
    receiptsBpd: number,
    shipmentsBpd: number,
    operatingDaysPerYear: number
): number {
    return Math.min(receiptsBpd, shipmentsBpd) * operatingDaysPerYear;
}

/** Truck loading rack lanes required */
export function rackLanesRequired(
    dailyVolumeBpd: number,
    loadingRateBph: number,
    operatingHoursPerDay: number,
    laneUtilizationPct: number
): number {
    if (loadingRateBph <= 0 || operatingHoursPerDay <= 0 || laneUtilizationPct <= 0) return 0;
    const throughputPerLane = loadingRateBph * operatingHoursPerDay * laneUtilizationPct / 100;
    return Math.ceil(dailyVolumeBpd / throughputPerLane);
}

/** Tank inventory days */
export function tankInventoryDays(
    tankCapacityBbl: number,
    dailyThroughputBpd: number,
    heelVolumeBbl: number
): number {
    if (dailyThroughputBpd <= 0) return 0;
    return (tankCapacityBbl - heelVolumeBbl) / dailyThroughputBpd;
}

/** Gain/loss reconciliation */
export function gainLossReconciliation(
    receiptsBbl: number,
    shipmentsBbl: number,
    inventoryChangeBbl: number
): { gainLossBbl: number; gainLossPct: number; status: string } {
    const expected = receiptsBbl - inventoryChangeBbl;
    const gainLossBbl = shipmentsBbl - expected;
    return {
        gainLossBbl,
        gainLossPct: receiptsBbl > 0 ? (gainLossBbl / receiptsBbl) * 100 : 0,
        status: Math.abs(gainLossBbl) < receiptsBbl * 0.002 ? 'Normal' :
            gainLossBbl > 0 ? 'Investigate gain' : 'Investigate loss'
    };
}

/** Tank turnover rate */
export function turnoverRate(
    annualThroughputBbl: number,
    tankCapacityBbl: number
): number {
    if (tankCapacityBbl <= 0) return 0;
    return annualThroughputBbl / tankCapacityBbl;
}

/** Tank switch frequency (days between product switches) */
export function tankSwitchFrequency(
    tankCapacityBbl: number,
    productDemandBpd: number,
    numProductGrades: number
): number {
    if (productDemandBpd <= 0 || numProductGrades <= 0) return 0;
    return tankCapacityBbl / (productDemandBpd / numProductGrades);
}

/** Loading time per truck */
export function loadingTimePerTruckMinutes(
    truckCapacityBbl: number,
    loadingRateGpm: number
): number {
    if (loadingRateGpm <= 0) return 0;
    return truckCapacityBbl * 42 / loadingRateGpm;
}

/** Vapor recovery efficiency */
export function vaporRecoveryEfficiency(
    vaporCollectedLb: number,
    vaporGeneratedLb: number
): number {
    if (vaporGeneratedLb <= 0) return 0;
    return (vaporCollectedLb / vaporGeneratedLb) * 100;
}

/** Terminal OPEX per barrel */
export function terminalOPEXPerBbl(
    annualOPEX: number,
    annualThroughputBbl: number
): number {
    if (annualThroughputBbl <= 0) return 0;
    return annualOPEX / annualThroughputBbl;
}

/** Additive injection rate at rack */
export function additiveInjectionRate(
    baseDosagePpm: number,
    productRateBph: number,
    additiveSg: number
): number {
    const galPerHour = baseDosagePpm * productRateBph * 42 / 1e6;
    return galPerHour;
}

// ───────────────────────────────────────────────────────────────
// 7.7 AVIATION FUEL
// ───────────────────────────────────────────────────────────────

/** Airport fuel farm capacity */
export function airportFuelFarmCapacity(
    peakDailyDemandBpd: number,
    daysOfSupply: number,
    hydrantSystemFillBbl: number
): number {
    return peakDailyDemandBpd * daysOfSupply + hydrantSystemFillBbl;
}

/** Hydrant system flow rate */
export function hydrantFlowRate(
    pumpDischargePsig: number,
    hydrantPressurePsig: number,
    pipeDiameterIn: number,
    pipeLengthFt: number,
    numAircraftPositions: number
): number {
    // Simplified hydraulic calculation
    const deltaP = pumpDischargePsig - hydrantPressurePsig;
    if (deltaP <= 0 || pipeDiameterIn <= 0 || pipeLengthFt <= 0) return 0;
    const flowFactor = Math.sqrt(deltaP / pipeLengthFt) * Math.pow(pipeDiameterIn, 2.5) * 0.8;
    return flowFactor * Math.min(numAircraftPositions, 4);
}

/** Aircraft fueling time */
export function aircraftFuelingTimeMinutes(
    fuelVolumeBbl: number,
    hydrantFlowRateGpm: number,
    numNozzles: number
): number {
    if (hydrantFlowRateGpm <= 0 || numNozzles <= 0) return 0;
    return fuelVolumeBbl * 42 / (hydrantFlowRateGpm * numNozzles);
}

/** Fuel quality check interval */
export function fuelQualityCheckInterval(
    daysSinceLastCheck: number,
    throughputSinceLast: number,
    maxDays: number,
    maxThroughput: number
): { checkDue: boolean; daysRemaining: number; throughputRemaining: number } {
    return {
        checkDue: daysSinceLastCheck >= maxDays || throughputSinceLast >= maxThroughput,
        daysRemaining: Math.max(0, maxDays - daysSinceLastCheck),
        throughputRemaining: Math.max(0, maxThroughput - throughputSinceLast)
    };
}

/** Filtration efficiency (coalescer/separator) */
export function filtrationEfficiency(
    inletWaterPpm: number,
    outletWaterPpm: number
): number {
    if (inletWaterPpm <= 0) return 0;
    return ((inletWaterPpm - outletWaterPpm) / inletWaterPpm) * 100;
}

/** SAF (Sustainable Aviation Fuel) blend ratio */
export function safBlendRatio(
    safVolumeBbl: number,
    conventionalJetBbl: number
): number {
    const total = safVolumeBbl + conventionalJetBbl;
    if (total <= 0) return 0;
    return (safVolumeBbl / total) * 100;
}

/** Static dissipater additive dosage */
export function staticDissipaterDosage(
    conductivityTargetPSU: number,
    baseConductivityPSU: number,
    additiveStrengthPpmPerPSU: number
): number {
    const needed = conductivityTargetPSU - baseConductivityPSU;
    return Math.max(0, needed * additiveStrengthPpmPerPSU);
}

/** Fuel farm days of supply */
export function fuelFarmDaysOfSupply(
    currentInventoryBbl: number,
    avgDailyBurnRateBpd: number,
    minSafetyBbl: number
): number {
    if (avgDailyBurnRateBpd <= 0) return 0;
    return (currentInventoryBbl - minSafetyBbl) / avgDailyBurnRateBpd;
}

/** Into-plane fueling cost */
export function intoPlaneFuelingCost(
    fuelCostPerBbl: number,
    intoPlaneFeePerBbl: number,
    fuelVolumeBbl: number
): number {
    return (fuelCostPerBbl + intoPlaneFeePerBbl) * fuelVolumeBbl;
}

/** Jet fuel thermal stability (JFTOT delta P approximation) */
export function jftotDeltaP(
    feedTotalSulfurPpm: number,
    feedNitrogenPpm: number,
    hydrotreatingSeverity: number
): number {
    // Higher severity = better stability
    return Math.max(0, 15 + feedNitrogenPpm * 0.01 + feedTotalSulfurPpm * 0.001 - hydrotreatingSeverity * 3);
}

// ───────────────────────────────────────────────────────────────
// 7.8 COMMERCIAL & REGULATORY
// ───────────────────────────────────────────────────────────────

/** Rack price breakdown */
export function rackPriceBreakdown(
    spotPricePerBbl: number,
    terminalMargin: number,
    brandingPremium: number,
    additiveCost: number
): number {
    return spotPricePerBbl + terminalMargin + brandingPremium + additiveCost;
}

/** Total tax per gallon */
export function totalTaxPerGallon(
    federalTaxCpg: number,
    stateTaxCpg: number,
    localTaxCpg: number,
    carbonTaxCpg: number
): number {
    return federalTaxCpg + stateTaxCpg + localTaxCpg + carbonTaxCpg;
}

/** Exchange/partial differential */
export function exchangeDifferential(
    contractPricePerBbl: number,
    spotPricePerBbl: number,
    exchangeFeePerBbl: number
): number {
    return contractPricePerBbl - spotPricePerBbl + exchangeFeePerBbl;
}

/** Supply disruption probability cost */
export function disruptionExpectedCost(
    probabilityOfDisruption: number, // 0-1
    financialImpactPerDay: number,
    daysOfDisruption: number
): number {
    return probabilityOfDisruption * financialImpactPerDay * daysOfDisruption;
}

/** Carbon tax cost per barrel */
export function carbonTaxCost(
    co2TonnesPerBbl: number,
    carbonPricePerTonne: number
): number {
    return co2TonnesPerBbl * carbonPricePerTonne;
}

/** RIN compliance cost (US Renewable Fuel Standard) */
export function rinComplianceCost(
    d6RinPrice: number,
    d4RinPrice: number,
    d5RinPrice: number,
    d6ObligationPct: number,
    d4ObligationPct: number,
    d5ObligationPct: number
): number {
    return d6RinPrice * d6ObligationPct / 100 +
        d4RinPrice * d4ObligationPct / 100 +
        d5RinPrice * d5ObligationPct / 100;
}

/** Biofuel blend margin */
export function biofuelBlendMargin(
    gasolinePricePerBbl: number,
    ethanolPricePerBbl: number,
    ethanolBlendPct: number,
    rinValuePerBbl: number
): number {
    return (gasolinePricePerBbl * (1 - ethanolBlendPct / 100) +
        ethanolPricePerBbl * ethanolBlendPct / 100 + rinValuePerBbl) - gasolinePricePerBbl;
}

/** Total delivered cost per gallon */
export function totalDeliveredCostPerGallon(
    exRefineryPricePerBbl: number,
    pipelineTariffPerBbl: number,
    terminalCostPerBbl: number,
    truckFreightPerBbl: number,
    taxesPerBbl: number
): number {
    const totalPerBbl = exRefineryPricePerBbl + pipelineTariffPerBbl +
        terminalCostPerBbl + truckFreightPerBbl + taxesPerBbl;
    return totalPerBbl / 42; // Convert to per gallon
}

/** Spot vs contract margin */
export function spotVsContractMargin(
    spotPricePerBbl: number,
    contractPricePerBbl: number,
    volumeBpd: number
): number {
    return (spotPricePerBbl - contractPricePerBbl) * volumeBpd;
}

/** Price formula (formula pricing for term contracts) */
export function formulaPrice(
    baseBenchmarkPerBbl: number,
    differential: number,
    escalatorPct: number,
    productQualityAdjustment: number
): number {
    return baseBenchmarkPerBbl * (1 + escalatorPct / 100) + differential + productQualityAdjustment;
}

/** Storage contango/backwardation play */
export function storageArbitrage(
    promptPricePerBbl: number,
    forwardPricePerBbl: number,
    storageCostPerBblPerMonth: number,
    monthsHeld: number,
    financingRatePct: number,
    promptPriceTotal: number
): number {
    const financeCost = promptPriceTotal * financingRatePct / 100 * monthsHeld / 12;
    return forwardPricePerBbl - promptPricePerBbl - storageCostPerBblPerMonth * monthsHeld - financeCost;
}

/** Volume-weighted average price */
export function volumeWeightedPrice(
    trades: { volumeBbl: number; pricePerBbl: number }[]
): number {
    const totalVol = trades.reduce((s, t) => s + t.volumeBbl, 0);
    if (totalVol <= 0) return 0;
    return trades.reduce((s, t) => s + t.volumeBbl * t.pricePerBbl, 0) / totalVol;
}

/** Product margin waterfall (all costs from refinery gate to customer) */
export function productMarginWaterfall(
    refGatewayPricePerBbl: number,
    logisticsCosts: { pipeline: number; terminal: number; truck: number; marine: number },
    taxesPerBbl: number,
    retailPricePerBbl: number
): { grossMargin: number; logisticsTotal: number; marginAfterLogistics: number; marginAfterTax: number } {
    const logisticsTotal = logisticsCosts.pipeline + logisticsCosts.terminal +
        logisticsCosts.truck + logisticsCosts.marine;
    const marginAfterLogistics = retailPricePerBbl - refGatewayPricePerBbl - logisticsTotal;
    const marginAfterTax = marginAfterLogistics - taxesPerBbl;
    return { grossMargin: retailPricePerBbl - refGatewayPricePerBbl, logisticsTotal, marginAfterLogistics, marginAfterTax };
}

// ───────────────────────────────────────────────────────────────
// 7.9 EXTENDED SUPPLY CHAIN ENGINEERING
// ───────────────────────────────────────────────────────────────

/** Economic Order Quantity (EOQ) for bulk liquid products */
export function economicOrderQuantity(
    annualDemandBbl: number,
    orderCostPerOrder: number,
    holdingCostPerBblPerYear: number
): number {
    if (holdingCostPerBblPerYear <= 0) return 0;
    return Math.sqrt((2 * annualDemandBbl * orderCostPerOrder) / holdingCostPerBblPerYear);
}

/** Fill rate (probability of no stockout) */
export function fillRate(
    totalDemandFulfilledBbl: number,
    totalDemandRequestedBbl: number
): number {
    if (totalDemandRequestedBbl <= 0) return 0;
    return (totalDemandFulfilledBbl / totalDemandRequestedBbl) * 100;
}

/** Service level from z-score (cumulative standard normal) */
export function serviceLevelFromZ(zScore: number): number {
    // Approximation of cumulative standard normal
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const p = 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return zScore >= 0 ? p * 100 : (1 - p) * 100;
}

/** Multi-echelon network optimization cost */
export function networkOptimizationCost(
    nodes: { supplyBpd: number; demandBpd: number; holdingCostPerBbl: number; transportationCostPerBbl: number }[],
    targetServiceLevelPct: number
): { totalAnnualCost: number; avgTransportCost: number; avgHoldingCost: number; echelons: number } {
    const n = nodes.length;
    const totalTransport = nodes.reduce((s, node) => s + node.transportationCostPerBbl, 0);
    const totalHolding = nodes.reduce((s, node) => s + node.holdingCostPerBbl, 0);
    const slFactor = 1 + (100 - targetServiceLevelPct) / 200;
    return {
        totalAnnualCost: (totalTransport + totalHolding) * slFactor * 100000,
        avgTransportCost: totalTransport / Math.max(n, 1),
        avgHoldingCost: totalHolding / Math.max(n, 1),
        echelons: n
    };
}

/** Inventory turnover ratio (annual) */
export function inventoryTurnoverRatio(
    annualCostOfGoodsSold: number,
    avgInventoryValue: number
): number {
    if (avgInventoryValue <= 0) return 0;
    return annualCostOfGoodsSold / avgInventoryValue;
}

/** Stockout probability based on demand variability */
export function stockoutProbability(
    reorderPointBbl: number,
    avgLeadTimeDemand: number,
    demandStdDev: number
): number {
    if (demandStdDev <= 0) return 0;
    const z = (reorderPointBbl - avgLeadTimeDemand) / demandStdDev;
    // Use normal approximation
    return Math.max(0, Math.min(100, (1 - serviceLevelFromZ(z) / 100) * 100));
}

/** Supply chain total landed cost breakdown */
export function supplyChainCostBreakdown(
    components: { name: string; costPerBbl: number; volumeBpd: number }[]
): { total: number; perBarrel: number; breakdown: { name: string; cost: number; pct: number }[] } {
    const totalVol = components.reduce((s, c) => s + c.volumeBpd, 0);
    const totalCost = components.reduce((s, c) => s + c.costPerBbl * c.volumeBpd, 0);
    return {
        total: totalCost,
        perBarrel: totalVol > 0 ? totalCost / totalVol : 0,
        breakdown: components.map(c => ({
            name: c.name,
            cost: c.costPerBbl * c.volumeBpd,
            pct: totalCost > 0 ? (c.costPerBbl * c.volumeBpd) / totalCost * 100 : 0
        }))
    };
}

/** Bullwhip effect amplification factor */
export function bullwhipAmplification(
    downstreamDemandVariance: number,
    upstreamOrderVariance: number
): number {
    if (downstreamDemandVariance <= 0) return 0;
    return upstreamOrderVariance / downstreamDemandVariance;
}

// ───────────────────────────────────────────────────────────────
// 7.10 EXTENDED PIPELINE ENGINEERING
// ───────────────────────────────────────────────────────────────

/** Hydraulic gradient (pressure drop per mile, psi/mile) */
export function hydraulicGradient(
    flowRateBpd: number,
    diameterIn: number,
    viscosityCst: number,
    specificGravity: number
): number {
    if (diameterIn <= 0) return 0;
    const velocityFps = flowRateBpd * 5.615 / (86400 * Math.PI * Math.pow(diameterIn / 24, 2));
    const re = 92.1 * diameterIn * velocityFps / (viscosityCst / specificGravity);
    const f = re > 2100 ? 0.0032 + 0.221 / Math.pow(re, 0.237) : 64 / Math.max(re, 1);
    return (f * specificGravity * Math.pow(velocityFps, 2)) / (diameterIn * 92.3);
}

/** Pump horsepower required for pipeline segment */
export function pumpHorsepowerRequired(
    flowRateBpd: number,
    totalHeadFt: number,
    specificGravity: number,
    efficiencyPct: number
): number {
    if (efficiencyPct <= 0) return 0;
    const gpm = flowRateBpd * 42 / 1440;
    return (gpm * totalHeadFt * specificGravity) / (3960 * efficiencyPct / 100);
}

/** Drag reducer agent (DRA) efficiency */
export function dragReducerEfficiency(
    baseFrictionPsiPerMile: number,
    draConcentrationPpm: number,
    maxReductionPct: number
): { reducedFriction: number; pctReduction: number; draConsumptionGalPerDay: number } {
    const pctReduction = maxReductionPct * (1 - Math.exp(-draConcentrationPpm / 25));
    const reducedFriction = baseFrictionPsiPerMile * (1 - pctReduction / 100);
    return {
        reducedFriction,
        pctReduction,
        draConsumptionGalPerDay: draConcentrationPpm * 1000 / 1e6 * 100000 // simplified
    };
}

/** Batch scheduling optimization (minimum cycle time) */
export function batchSchedulingOptimization(
    products: { name: string; demandBpd: number; minBatchBbl: number }[]
): { optimalCycleDays: number; batchesPerCycle: number; totalVolumeBbl: number } {
    const totalDemand = products.reduce((s, p) => s + p.demandBpd, 0);
    const minBatch = Math.max(...products.map(p => p.minBatchBbl));
    const numBatches = products.length;
    const cycleDays = (minBatch * numBatches) / Math.max(totalDemand, 1);
    return {
        optimalCycleDays: Math.ceil(cycleDays),
        batchesPerCycle: numBatches,
        totalVolumeBbl: totalDemand * cycleDays
    };
}

/** Leak detection sensitivity (mass balance) */
export function leakDetectionSensitivity(
    inletFlowBpd: number,
    outletFlowBpd: number,
    linefillChangeBblPerHr: number,
    instrumentAccuracyPct: number
): { massImbalanceBpd: number; detectable: boolean; minDetectableLeakBpd: number } {
    const imbalance = inletFlowBpd - outletFlowBpd - linefillChangeBblPerHr * 24;
    const threshold = inletFlowBpd * instrumentAccuracyPct / 100 * 2;
    return {
        massImbalanceBpd: Math.abs(imbalance),
        detectable: Math.abs(imbalance) > threshold,
        minDetectableLeakBpd: threshold
    };
}

/** Pipeline surge pressure (water hammer) */
export function surgePressurePsi(
    velocityChangeFps: number,
    fluidDensityLbPerGal: number,
    bulkModulusPsi: number,
    pipeDiameterIn: number,
    pipeWallThicknessIn: number,
    pipeElasticModulusPsi: number
): number {
    const kOverE = bulkModulusPsi / pipeElasticModulusPsi;
    const pipeFactor = pipeDiameterIn / Math.max(pipeWallThicknessIn, 0.001);
    const waveSpeedFps = Math.sqrt(bulkModulusPsi * 144 / (fluidDensityLbPerGal * 0.1337)) /
        Math.sqrt(1 + kOverE * pipeFactor * 0.93);
    return fluidDensityLbPerGal * 0.1337 * waveSpeedFps * velocityChangeFps / (144 * 32.174);
}

/** Corrosion rate estimation (mpy - mils per year) */
export function pipelineCorrosionRate(
    co2PartialPressurePsi: number,
    h2sPartialPressurePsi: number,
    temperatureF: number,
    flowVelocityFps: number,
    pH: number
): number {
    const co2Rate = co2PartialPressurePsi * Math.exp(-2900 / (temperatureF + 460)) * Math.pow(flowVelocityFps, 0.8) / (pH * pH);
    const h2sRate = h2sPartialPressurePsi * 0.1 * Math.pow(temperatureF / 150, 1.5);
    return co2Rate + h2sRate;
}

// ───────────────────────────────────────────────────────────────
// 7.11 EXTENDED MARINE LOGISTICS
// ───────────────────────────────────────────────────────────────

/** Bunker fuel consumption for vessel voyage */
export function bunkerFuelConsumption(
    vesselSpeedKnots: number,
    designSpeedKnots: number,
    designConsumptionMtPerDay: number,
    voyageDays: number,
    seaMarginPct: number
): number {
    if (designSpeedKnots <= 0) return 0;
    const speedRatio = vesselSpeedKnots / designSpeedKnots;
    const actualConsumption = designConsumptionMtPerDay * Math.pow(speedRatio, 3) * (1 + seaMarginPct / 100);
    return actualConsumption * voyageDays;
}

/** Port time optimization (gang assignment) */
export function portTimeOptimization(
    cargoBbl: number,
    pumpRateBphPerGang: number,
    numGangs: number,
    mooringTimeHrs: number,
    documentationTimeHrs: number
): number {
    if (pumpRateBphPerGang <= 0 || numGangs <= 0) return 0;
    const pumpingHours = cargoBbl / (pumpRateBphPerGang * numGangs);
    return pumpingHours + mooringTimeHrs + documentationTimeHrs;
}

/** Ship routing efficiency (Great Circle vs actual) */
export function shipRoutingEfficiency(
    greatCircleDistanceNm: number,
    actualRouteDistanceNm: number
): number {
    if (actualRouteDistanceNm <= 0) return 0;
    return (greatCircleDistanceNm / actualRouteDistanceNm) * 100;
}

/** Cargo compatibility matrix check for multi-product vessels */
export function cargoCompatibilityMatrix(
    cargoes: { name: string; imdgClass: string; unNumber: string }[]
): { compatible: boolean; conflicts: string[] } {
    const incompatible = [
        ['3', '1'], ['3', '5.1'], ['2.1', '5.1'],
        ['8', '3'], ['8', '4.1'], ['5.1', '4.1']
    ];
    const conflicts: string[] = [];
    for (let i = 0; i < cargoes.length; i++) {
        for (let j = i + 1; j < cargoes.length; j++) {
            const pair = [cargoes[i].imdgClass, cargoes[j].imdgClass].sort();
            if (incompatible.some(inc => inc[0] === pair[0] && inc[1] === pair[1])) {
                conflicts.push(`${cargoes[i].name} ❌ ${cargoes[j].name}`);
            }
        }
    }
    return { compatible: conflicts.length === 0, conflicts };
}

/** Draft restriction check for port access */
export function draftRestrictionCheck(
    vesselDraftM: number,
    channelMaxDraftM: number,
    tideWindowM: number,
    ukcRequiredM: number
): { accessible: boolean; maxCargoReductionBbl: number; tideRequiredM: number } {
    const availableDraft = channelMaxDraftM + tideWindowM - ukcRequiredM;
    const tideRequired = Math.max(0, vesselDraftM - channelMaxDraftM + ukcRequiredM);
    const draftExcess = Math.max(0, vesselDraftM - availableDraft);
    const tpc = 50; // tonnes per cm immersion (simplified)
    return {
        accessible: availableDraft >= vesselDraftM,
        maxCargoReductionBbl: draftExcess * 100 * tpc / 0.1589 / 1000, // metric tons to bbl
        tideRequiredM: tideRequired
    };
}

/** STS lightering operation time */
export function lighteringOperationTime(
    cargoBbl: number,
    hoseSizeIn: number,
    pumpingRateBph: number,
    approachMooringHours: number
): number {
    if (pumpingRateBph <= 0) return 0;
    return cargoBbl / pumpingRateBph + approachMooringHours;
}

/** Vessel turnaround time at terminal */
export function vesselTurnaroundTime(
    cargoBbl: number,
    loadingRateBph: number,
    preArrivalHours: number,
    postDepartureHours: number,
    inspectionHours: number
): number {
    if (loadingRateBph <= 0) return 0;
    return cargoBbl / loadingRateBph + preArrivalHours + postDepartureHours + inspectionHours;
}

// ───────────────────────────────────────────────────────────────
// 7.12 EXTENDED RAIL FREIGHT OPERATIONS
// ───────────────────────────────────────────────────────────────

/** Rail vs truck cost comparison */
export function railVsTruckComparison(
    volumeBblPerMonth: number,
    railRatePerBbl: number,
    truckRatePerBbl: number,
    railFixedCostPerMonth: number,
    truckMinLoadBbl: number
): { railTotal: number; truckTotal: number; savingsRail: number; breakoverVolumeBbl: number } {
    const railTotal = volumeBblPerMonth * railRatePerBbl + railFixedCostPerMonth;
    const truckTrips = Math.ceil(volumeBblPerMonth / Math.max(truckMinLoadBbl, 1));
    const truckTotal = volumeBblPerMonth * truckRatePerBbl;
    const savings = truckTotal - railTotal;
    // Break-even volume where rail becomes cheaper
    const rateDiff = truckRatePerBbl - railRatePerBbl;
    const breakover = rateDiff > 0 ? railFixedCostPerMonth / rateDiff : 0;
    return { railTotal, truckTotal, savingsRail: savings, breakoverVolumeBbl: breakover };
}

/** Tank car classification (DOT-111, DOT-117, etc.) */
export function tankCarClassification(
    productFlashPointF: number,
    vaporPressurePsia: number,
    corrosivity: 'low' | 'medium' | 'high'
): { dotClass: string; maxCapacityBbl: number; requiredThicknessIn: number; liningRequired: boolean } {
    const needsJacketing = vaporPressurePsia > 25;
    const corrosionFactors: Record<string, number> = { low: 0.5, medium: 1.0, high: 1.5 };
    const cf = corrosionFactors[corrosivity] ?? 1;
    const baseThickness = 0.4375 * cf;
    const needsLining = corrosivity === 'high';
    if (needsJacketing || vaporPressurePsia > 15) {
        return { dotClass: 'DOT-117J', maxCapacityBbl: 690, requiredThicknessIn: baseThickness + 0.0625, liningRequired: needsLining };
    }
    if (productFlashPointF < 73) {
        return { dotClass: 'DOT-117R', maxCapacityBbl: 710, requiredThicknessIn: baseThickness, liningRequired: needsLining };
    }
    return { dotClass: 'DOT-111A', maxCapacityBbl: 720, requiredThicknessIn: baseThickness, liningRequired: false };
}

/** HAZMAT routing risk assessment */
export function hazmatRoutingRisk(
    routePopulationDensity: number, // per sq mile
    routeLengthMiles: number,
    accidentRatePerMillionMiles: number,
    releaseConditionalProbability: number
): { riskScore: number; expectedIncidentsPerYear: number; recommendedAction: string } {
    const exposure = routePopulationDensity * routeLengthMiles;
    const expected = accidentRatePerMillionMiles * routeLengthMiles / 1e6 * releaseConditionalProbability;
    const riskScore = expected * exposure / 1000;
    return {
        riskScore,
        expectedIncidentsPerYear: expected,
        recommendedAction: riskScore > 100 ? 'Reroute required' : riskScore > 50 ? 'Enhanced mitigation' : 'Standard routing OK'
    };
}

/** Rail scheduling optimization (slot allocation) */
export function railSchedulingOptimization(
    weeklyVolumeBbl: number,
    carsPerTrain: number,
    capacityPerCarBbl: number,
    loadingDaysAvailable: number
): { trainsPerWeek: number; slotsPerDay: number; utilizationPct: number } {
    const carsNeeded = Math.ceil(weeklyVolumeBbl / Math.max(capacityPerCarBbl, 1));
    const trainsPerWeek = Math.max(1, Math.ceil(carsNeeded / Math.max(carsPerTrain, 1)));
    const slotsPerDay = Math.max(1, Math.ceil(trainsPerWeek / Math.max(loadingDaysAvailable, 1)));
    const maxTrains = slotsPerDay * loadingDaysAvailable;
    return {
        trainsPerWeek,
        slotsPerDay,
        utilizationPct: maxTrains > 0 ? (trainsPerWeek / maxTrains) * 100 : 0
    };
}

/** Transloading cost from rail to truck */
export function transloadingCost(
    volumeBbl: number,
    transloadFeePerBbl: number,
    storageDays: number,
    dailyStorageRatePerBbl: number,
    equipmentRentalPerDay: number
): number {
    return volumeBbl * transloadFeePerBbl + volumeBbl * storageDays * dailyStorageRatePerBbl + equipmentRentalPerDay * Math.ceil(storageDays);
}

// ───────────────────────────────────────────────────────────────
// 7.13 EXTENDED TRUCK FLEET MANAGEMENT
// ───────────────────────────────────────────────────────────────

/** Route optimization savings */
export function routeOptimizationSavings(
    totalDailyMiles: number,
    numStops: number,
    avgMilesPerStop: number,
    optimizationEfficiencyPct: number
): { optimizedMiles: number; savingsMiles: number; savingsGal: number; savingsDollars: number } {
    const baseMiles = totalDailyMiles;
    const optimizedMiles = baseMiles * (1 - optimizationEfficiencyPct / 100);
    const savingsMiles = baseMiles - optimizedMiles;
    const mpg = 6; // average tank truck
    const dieselCostPerGal = 4.5;
    return {
        optimizedMiles,
        savingsMiles,
        savingsGal: savingsMiles / mpg,
        savingsDollars: savingsMiles / mpg * dieselCostPerGal
    };
}

/** Tank truck compartment allocation */
export function tankTruckCompartmentAllocation(
    orderVolumes: number[], // bbl per product
    compartmentSizes: number[] // available compartments in bbl
): { assignments: { orderIdx: number; compartmentIdx: number; volume: number }[]; wastedBbl: number; utilizationPct: number } {
    const sortedOrders = orderVolumes.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
    const sortedComps = compartmentSizes.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
    const assignments: { orderIdx: number; compartmentIdx: number; volume: number }[] = [];
    let totalAssign = 0;
    let totalComp = 0;
    for (let o = 0; o < sortedOrders.length && o < sortedComps.length; o++) {
        const vol = Math.min(sortedOrders[o].v, sortedComps[o].v);
        assignments.push({ orderIdx: sortedOrders[o].i, compartmentIdx: sortedComps[o].i, volume: vol });
        totalAssign += vol;
        totalComp += sortedComps[o].v;
    }
    return {
        assignments,
        wastedBbl: totalComp - totalAssign,
        utilizationPct: totalComp > 0 ? (totalAssign / totalComp) * 100 : 0
    };
}

/** Driver hours of service extended check (7-day/8-day cycle) */
export function hosExtendedCheck(
    drivingHoursToday: number,
    onDutyHoursLast7Days: number,
    onDutyHoursLast8Days: number
): { drivingRemaining: number; onDutyRemaining7: number; onDutyRemaining8: number; violation: boolean; message: string } {
    const maxDriving = 11;
    const maxDuty7 = 60;
    const maxDuty8 = 70;
    const drivingR = Math.max(0, maxDriving - drivingHoursToday);
    const duty7R = Math.max(0, maxDuty7 - onDutyHoursLast7Days);
    const duty8R = Math.max(0, maxDuty8 - onDutyHoursLast8Days);
    const violation = drivingR <= 0 || duty7R <= 0 || duty8R <= 0;
    let message = 'Compliant';
    if (drivingR <= 0) message = 'VIOLATION: Driving hours exceeded';
    else if (duty7R <= 0) message = 'VIOLATION: 7-day duty limit exceeded';
    else if (duty8R <= 0) message = 'VIOLATION: 8-day duty limit exceeded';
    return { drivingRemaining: drivingR, onDutyRemaining7: duty7R, onDutyRemaining8: duty8R, violation, message };
}

/** Deadhead reduction efficiency */
export function deadheadReduction(
    loadedMilesToday: number,
    emptyMilesToday: number,
    backhaulOpportunityMiles: number
): { deadheadPct: number; withBackhaulPct: number; improvement: number } {
    const total = loadedMilesToday + emptyMilesToday;
    const currentDH = total > 0 ? (emptyMilesToday / total) * 100 : 0;
    const newEmpty = Math.max(0, emptyMilesToday - backhaulOpportunityMiles);
    const newDH = total > 0 ? (newEmpty / total) * 100 : 0;
    return {
        deadheadPct: currentDH,
        withBackhaulPct: newDH,
        improvement: currentDH - newDH
    };
}

/** Emissions per delivery */
export function emissionsPerDelivery(
    milesDriven: number,
    mpg: number,
    idleTimeMinutes: number,
    gallonsDelivered: number
): { co2Lbs: number; co2PerGallon: number; noxGrams: number } {
    const fuelGal = milesDriven / Math.max(mpg, 1);
    const idleGal = idleTimeMinutes * 0.02; // ~0.02 gal/min idle
    const totalGal = fuelGal + idleGal;
    const co2Lbs = totalGal * 22.4; // ~22.4 lbs CO2 per gallon diesel
    const noxGrams = totalGal * 120; // ~120g NOx per gallon diesel
    return {
        co2Lbs,
        co2PerGallon: gallonsDelivered > 0 ? co2Lbs / gallonsDelivered : 0,
        noxGrams
    };
}

/** Tank truck lifecycle cost analysis */
export function truckLifecycleCost(
    purchasePrice: number,
    annualMaintCost: number,
    annualFuelCost: number,
    annualInsurance: number,
    yearsOfService: number,
    salvageValue: number,
    annualMiles: number
): { totalCost: number; costPerMile: number; costPerYear: number } {
    const totalOperating = (annualMaintCost + annualFuelCost + annualInsurance) * yearsOfService;
    const totalCost = purchasePrice + totalOperating - salvageValue;
    const totalMiles = annualMiles * yearsOfService;
    return {
        totalCost,
        costPerMile: totalMiles > 0 ? totalCost / totalMiles : 0,
        costPerYear: totalCost / yearsOfService
    };
}

// ───────────────────────────────────────────────────────────────
// 7.14 EXTENDED TERMINAL AUTOMATION
// ───────────────────────────────────────────────────────────────

/** Tank farm optimization (heuristic allocation) */
export function tankFarmOptimization(
    tanks: { capacityBbl: number; currentBbl: number; productType: string }[],
    incomingBatchBbl: number,
    incomingProductType: string
): { assignedTank: number; remainingUllageBbl: number; needsAdditionalTank: boolean } {
    const compatible = tanks
        .map((t, i) => ({ ...t, idx: i, ullage: t.capacityBbl - t.currentBbl }))
        .filter(t => t.productType === incomingProductType && t.ullage > 0)
        .sort((a, b) => Math.abs(a.ullage - incomingBatchBbl) - Math.abs(b.ullage - incomingBatchBbl));
    if (compatible.length === 0) {
        return { assignedTank: -1, remainingUllageBbl: -incomingBatchBbl, needsAdditionalTank: true };
    }
    const best = compatible[0];
    return {
        assignedTank: best.idx,
        remainingUllageBbl: best.ullage - incomingBatchBbl,
        needsAdditionalTank: best.ullage < incomingBatchBbl
    };
}

/** Additive blending accuracy at terminal */
export function additiveBlendingAccuracy(
    targetDosagePpm: number,
    actualDosagePpm: number,
    productVolumeBbl: number
): { errorPct: number; additiveExcessGal: number; inSpec: boolean } {
    const errorPct = targetDosagePpm > 0 ? ((actualDosagePpm - targetDosagePpm) / targetDosagePpm) * 100 : 0;
    const volumeGal = productVolumeBbl * 42;
    const excessGal = volumeGal * (actualDosagePpm - targetDosagePpm) / 1e6;
    return {
        errorPct,
        additiveExcessGal: Math.abs(excessGal),
        inSpec: Math.abs(errorPct) <= 5 // within 5% of target
    };
}

/** Custody transfer accuracy (API MPMS Chap. 12) */
export function custodyTransferAccuracy(
    meteredVolumeBbl: number,
    proverVolumeBbl: number,
    meterFactor: number
): { correctedVolumeBbl: number; meterErrorPct: number; passedProving: boolean } {
    const corrected = meteredVolumeBbl * meterFactor;
    const errorPct = proverVolumeBbl > 0 ? ((meteredVolumeBbl - proverVolumeBbl) / proverVolumeBbl) * 100 : 0;
    return {
        correctedVolumeBbl: corrected,
        meterErrorPct: Math.abs(errorPct),
        passedProving: Math.abs(errorPct) <= 0.25 // within 0.25% per API MPMS
    };
}

/** Terminal scheduling optimization */
export function terminalScheduling(
    bays: { bayId: number; capacityBph: number; availableSlots: number }[],
    requests: { productVolumeBbl: number; priority: 'high' | 'medium' | 'low' }[]
): { scheduled: { requestIdx: number; bayId: number; hoursNeeded: number }[]; rejected: number } {
    const scheduled: { requestIdx: number; bayId: number; hoursNeeded: number }[] = [];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedRequests = requests.map((r, i) => ({ ...r, idx: i })).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const baySlots = bays.map(b => ({ ...b, used: 0 }));
    let rejected = 0;
    for (const req of sortedRequests) {
        let assigned = false;
        for (const bay of baySlots) {
            if (bay.used < bay.availableSlots) {
                const hours = req.productVolumeBbl / Math.max(bay.capacityBph, 1);
                scheduled.push({ requestIdx: req.idx, bayId: bay.bayId, hoursNeeded: hours });
                bay.used++;
                assigned = true;
                break;
            }
        }
        if (!assigned) rejected++;
    }
    return { scheduled, rejected };
}

/** Spill containment capacity check */
export function spillContainmentCapacity(
    largestTankBbl: number,
    secondaryContainmentBbl: number,
    regulatoryFactor: number
): { requiredBbl: number; actualBbl: number; compliant: boolean; deficiencyBbl: number } {
    const required = largestTankBbl * regulatoryFactor;
    return {
        requiredBbl: required,
        actualBbl: secondaryContainmentBbl,
        compliant: secondaryContainmentBbl >= required,
        deficiencyBbl: Math.max(0, required - secondaryContainmentBbl)
    };
}

/** Vapor recovery efficiency with combustion */
export function vaporRecoveryWithCombustion(
    vaporGenerationRateLbPerHr: number,
    recoverySystemCapacityLbPerHr: number,
    combustionEfficiencyPct: number
): { recoveredPct: number; emissionsLbPerHr: number; compliance: 'EPA Compliant' | 'Exceeds EPA' | 'Violation' } {
    const recovered = Math.min(vaporGenerationRateLbPerHr, recoverySystemCapacityLbPerHr);
    const recoveredPct = vaporGenerationRateLbPerHr > 0 ? (recovered / vaporGenerationRateLbPerHr) * 100 : 100;
    const emissions = vaporGenerationRateLbPerHr - recovered;
    const compliance = emissions > 5 ? 'Violation' : emissions > 2 ? 'Exceeds EPA' : 'EPA Compliant';
    return { recoveredPct, emissionsLbPerHr: emissions, compliance };
}

// ───────────────────────────────────────────────────────────────
// 7.15 EXTENDED AVIATION FUEL OPERATIONS
// ───────────────────────────────────────────────────────────────

/** Jet fuel thermal stability (JFTOT delta P) */
export function JFTOTResult(
    deltaPMmHg: number,
    tubeRating: number,
    tempC: number
): { pass: boolean; riskOfDeposit: 'Low' | 'Medium' | 'High'; maxAllowableTempC: number } {
    const pass = deltaPMmHg <= 25 && tubeRating < 3 && tempC <= 260;
    const risk = deltaPMmHg > 25 ? 'High' : deltaPMmHg > 15 ? 'Medium' : 'Low';
    return {
        pass,
        riskOfDeposit: risk,
        maxAllowableTempC: deltaPMmHg > 25 ? 230 : deltaPMmHg > 15 ? 250 : 260
    };
}

/** Fuel additive concentration tracking */
export function additiveConcentration(
    additiveName: string,
    targetMgPerLiter: number,
    actualMgPerLiter: number,
    jetFuelVolumeBbl: number
): { errorPct: number; topUpRequiredGal: number; inSpec: boolean } {
    const errorPct = targetMgPerLiter > 0 ? ((actualMgPerLiter - targetMgPerLiter) / targetMgPerLiter) * 100 : 0;
    const volumeLiters = jetFuelVolumeBbl * 158.987;
    const deficit = Math.max(0, (targetMgPerLiter - actualMgPerLiter) * volumeLiters / 1e6);
    return {
        errorPct,
        topUpRequiredGal: deficit, // kg -> approx gal
        inSpec: Math.abs(errorPct) <= 10
    };
}

/** Filtration pressure drop (Darcy's law for filter media) */
export function filtrationPressureDrop(
    flowRateGpm: number,
    viscosityCp: number,
    filterAreaFt2: number,
    permeabilityDarcy: number,
    cakeThicknessIn: number
): number {
    if (filterAreaFt2 <= 0 || permeabilityDarcy <= 0) return 0;
    return (flowRateGpm * viscosityCp * cakeThicknessIn) / (filterAreaFt2 * permeabilityDarcy * 0.001127);
}

/** Hydrant system pressure calculation */
export function hydrantSystemPressure(
    basePressurePsig: number,
    flowRateGpm: number,
    pipeDiameterIn: number,
    pipeLengthFt: number,
    elevationChangeFt: number
): { pressureAtHydrantPsig: number; flowRateAtHydrantGpm: number; adequate: boolean } {
    const areaFt2 = Math.PI * Math.pow(pipeDiameterIn / 12, 2) / 4;
    const velocityFps = flowRateGpm / (448.8 * areaFt2);
    const frictionLoss = 0.2083 * Math.pow(100 / 100, 1.85) * Math.pow(flowRateGpm, 1.85) / Math.pow(pipeDiameterIn, 4.8655) * pipeLengthFt / 100;
    const elevationHead = elevationChangeFt * 0.433;
    const pressure = basePressurePsig - frictionLoss - elevationHead;
    return {
        pressureAtHydrantPsig: Math.max(0, pressure),
        flowRateAtHydrantGpm: flowRateGpm * Math.sqrt(Math.max(0, pressure) / Math.max(basePressurePsig, 1)),
        adequate: pressure >= 40 // minimum 40 psig at hydrant
    };
}

/** Fuel farm expansion planning */
export function fuelFarmExpansion(
    currentCapacityBbl: number,
    currentDemandBpd: number,
    projectedDemandBpd: number,
    requiredDaysCover: number
): { additionalCapacityBbl: number; tanksToAdd: number; estimatedCost: number } {
    const requiredCapacity = projectedDemandBpd * requiredDaysCover;
    const additional = Math.max(0, requiredCapacity - currentCapacityBbl);
    const typicalTankSize = 40000; // bbl for jet fuel tanks
    const tanksToAdd = Math.ceil(additional / typicalTankSize);
    return {
        additionalCapacityBbl: additional,
        tanksToAdd,
        estimatedCost: tanksToAdd * typicalTankSize * 450 // ~$450 per bbl for new tankage
    };
}

// ───────────────────────────────────────────────────────────────
// 7.16 EXTENDED COMMERCIAL ANALYTICS
// ───────────────────────────────────────────────────────────────

/** Netback pricing at any point in supply chain */
export function netbackPricing(
    productValueAtDestinationPerBbl: number,
    transportationCosts: { name: string; costPerBbl: number }[],
    terminalCosts: { name: string; costPerBbl: number }[],
    blendingCostPerBbl: number
): { netbackPerBbl: number; totalDeductions: number; breakdown: { item: string; costPerBbl: number }[] } {
    const totalTransport = transportationCosts.reduce((s, c) => s + c.costPerBbl, 0);
    const totalTerminal = terminalCosts.reduce((s, c) => s + c.costPerBbl, 0);
    const totalDeductions = totalTransport + totalTerminal + blendingCostPerBbl;
    const breakdown = [
        ...transportationCosts.map(c => ({ item: `Transport: ${c.name}`, costPerBbl: c.costPerBbl })),
        ...terminalCosts.map(c => ({ item: `Terminal: ${c.name}`, costPerBbl: c.costPerBbl })),
        { item: 'Blending', costPerBbl: blendingCostPerBbl }
    ];
    return {
        netbackPerBbl: productValueAtDestinationPerBbl - totalDeductions,
        totalDeductions,
        breakdown
    };
}

/** Supply contract valuation (term vs spot) */
export function supplyContractValuation(
    termVolumeBblPerYear: number,
    termPricePerBbl: number,
    expectedSpotPricePerBbl: number,
    spotVolatilityPct: number,
    yearsRemaining: number,
    discountRatePct: number
): { npvOfSavings: number; annualSavings: number; riskAdjustedValue: number; recommend: string } {
    const annualSavings = termVolumeBblPerYear * (expectedSpotPricePerBbl - termPricePerBbl);
    let npv = 0;
    for (let y = 1; y <= yearsRemaining; y++) {
        npv += annualSavings / Math.pow(1 + discountRatePct / 100, y);
    }
    const riskAdjustment = 1 - spotVolatilityPct / 200;
    return {
        npvOfSavings: npv,
        annualSavings,
        riskAdjustedValue: npv * riskAdjustment,
        recommend: npv > 0 ? 'Lock in term contract' : 'Stay on spot market'
    };
}

/** Exchange agreement value between suppliers */
export function exchangeAgreementValue(
    locationADeliveriesBbl: number,
    locationBDeliveriesBbl: number,
    locationAPricePerBbl: number,
    locationBPricePerBbl: number,
    transportationSavingsPerBbl: number
): { totalValue: number; netBenefitA: number; netBenefitB: number; fairAdjustment: number } {
    const valueWithoutExchange = locationADeliveriesBbl * locationAPricePerBbl + locationBDeliveriesBbl * locationBPricePerBbl;
    // After exchange, both locations save transportation
    const postExchangeSavings = (locationADeliveriesBbl + locationBDeliveriesBbl) * transportationSavingsPerBbl;
    const fairAdjustment = (locationBPricePerBbl - locationAPricePerBbl) * Math.min(locationADeliveriesBbl, locationBDeliveriesBbl);
    return {
        totalValue: postExchangeSavings,
        netBenefitA: postExchangeSavings / 2 + fairAdjustment / 2,
        netBenefitB: postExchangeSavings / 2 - fairAdjustment / 2,
        fairAdjustment
    };
}

/** Hedging ratio for commodity price risk */
export function hedgingRatio(
    spotPriceVolatility: number,
    futuresPriceVolatility: number,
    correlation: number
): { optimalHedgeRatio: number; hedgeEffectiveness: number } {
    if (futuresPriceVolatility <= 0) return { optimalHedgeRatio: 0, hedgeEffectiveness: 0 };
    const hStar = correlation * (spotPriceVolatility / futuresPriceVolatility);
    return {
        optimalHedgeRatio: Math.max(0, Math.min(1, hStar)),
        hedgeEffectiveness: correlation * correlation * 100
    };
}

/** Credit exposure on open accounts */
export function creditExposure(
    avgDailySalesBbl: number,
    pricePerBbl: number,
    paymentTermsDays: number,
    defaultProbabilityPct: number
): { totalExposure: number; expectedLoss: number; creditLimitRecommended: number } {
    const exposure = avgDailySalesBbl * pricePerBbl * paymentTermsDays;
    const expectedLoss = exposure * defaultProbabilityPct / 100;
    return {
        totalExposure: exposure,
        expectedLoss,
        creditLimitRecommended: exposure * 1.2
    };
}

/** Shipping economics - COA (contract of affreightment) vs spot charter */
export function coaVsSpot(
    annualVolumeBbl: number,
    coaRatePerBbl: number,
    spotRatePerBbl: number,
    spotVolatilityPct: number,
    vesselSizeBbl: number
): { coaAnnualCost: number; spotAnnualCost: number; savings: number; voyagesPerYear: number } {
    const voyagesPerYear = Math.ceil(annualVolumeBbl / Math.max(vesselSizeBbl, 1));
    const coaAnnualCost = annualVolumeBbl * coaRatePerBbl;
    const spotAnnualCost = annualVolumeBbl * spotRatePerBbl * (1 + spotVolatilityPct / 200);
    return {
        coaAnnualCost,
        spotAnnualCost,
        savings: spotAnnualCost - coaAnnualCost,
        voyagesPerYear
    };
}

/** Distribution margin analysis across channels */
export function channelMarginAnalysis(
    channels: { name: string; volumeBpd: number; pricePerBbl: number; costPerBbl: number }[]
): { totalMarginPerDay: number; avgMarginPerBbl: number; bestChannel: string; worstChannel: string } {
    let best = { name: '', margin: -Infinity };
    let worst = { name: '', margin: Infinity };
    let totalMargin = 0;
    let totalVol = 0;
    for (const ch of channels) {
        const margin = ch.volumeBpd * (ch.pricePerBbl - ch.costPerBbl);
        const unitMargin = ch.pricePerBbl - ch.costPerBbl;
        totalMargin += margin;
        totalVol += ch.volumeBpd;
        if (unitMargin > best.margin) best = { name: ch.name, margin: unitMargin };
        if (unitMargin < worst.margin) worst = { name: ch.name, margin: unitMargin };
    }
    return {
        totalMarginPerDay: totalMargin,
        avgMarginPerBbl: totalVol > 0 ? totalMargin / totalVol : 0,
        bestChannel: best.name,
        worstChannel: worst.name
    };
}

/** Demurrage optimization (minimize demurrage costs) */
export function demurrageOptimization(
    contractFreeDays: number,
    actualDays: number,
    demurrageRatePerDay: number,
    despatchRatePerDay: number
): { demurrageCost: number; hasDespatch: boolean; despatchCredit: number; netCost: number } {
    if (actualDays <= contractFreeDays) {
        const despatch = (contractFreeDays - actualDays) * despatchRatePerDay * 0.5; // half despatch
        return { demurrageCost: 0, hasDespatch: true, despatchCredit: despatch, netCost: -despatch };
    }
    const demurrageCost = (actualDays - contractFreeDays) * demurrageRatePerDay;
    return { demurrageCost, hasDespatch: false, despatchCredit: 0, netCost: demurrageCost };
}

/** Product allocation optimization (which products to prioritize in constrained capacity) */
export function productAllocation(
    products: { name: string; marginPerBbl: number; demandBpd: number }[],
    totalCapacityBpd: number
): { allocated: { name: string; volumeBpd: number; marginGenerated: number }[]; totalMargin: number; capacityUsed: number } {
    const sorted = [...products].sort((a, b) => b.marginPerBbl - a.marginPerBbl);
    const allocated: { name: string; volumeBpd: number; marginGenerated: number }[] = [];
    let remaining = totalCapacityBpd;
    let totalMargin = 0;
    for (const p of sorted) {
        const allocate = Math.min(p.demandBpd, remaining);
        allocated.push({ name: p.name, volumeBpd: allocate, marginGenerated: allocate * p.marginPerBbl });
        totalMargin += allocate * p.marginPerBbl;
        remaining -= allocate;
        if (remaining <= 0) break;
    }
    return { allocated, totalMargin, capacityUsed: totalCapacityBpd - remaining };
}

/** Carbon intensity per delivery mode (g CO2e / bbl-mile) */
export function carbonIntensity(
    modes: { name: string; gCO2ePerTonMile: number; volumeBbl: number; distanceMiles: number; densitySG: number }[]
): { totalEmissionsTonnes: number; breakdown: { name: string; tonnesCO2e: number; pct: number }[] } {
    const breakdown = modes.map(m => {
        const tonnes = m.volumeBbl * m.densitySG * 0.1589 * m.distanceMiles * m.gCO2ePerTonMile / 1e6;
        return { name: m.name, tonnesCO2e: tonnes, pct: 0 };
    });
    const total = breakdown.reduce((s, b) => s + b.tonnesCO2e, 0);
    breakdown.forEach(b => { b.pct = total > 0 ? (b.tonnesCO2e / total) * 100 : 0; });
    return { totalEmissionsTonnes: total, breakdown };
}

/** Storage terminal throughput forecast */
export function terminalThroughputForecast(
    historicalThroughputBpd: number[],
    growthRatePct: number,
    monthsForward: number
): { forecast: number[]; avgForecast: number; peakMonth: number } {
    const base = historicalThroughputBpd[historicalThroughputBpd.length - 1] ?? 0;
    const forecast: number[] = [];
    for (let m = 1; m <= monthsForward; m++) {
        forecast.push(base * Math.pow(1 + growthRatePct / 100 / 12, m));
    }
    const avg = forecast.reduce((s, f) => s + f, 0) / Math.max(forecast.length, 1);
    const peak = forecast.reduce((max, f, i) => f > max.val ? { val: f, idx: i + 1 } : max, { val: 0, idx: 1 });
    return { forecast, avgForecast: avg, peakMonth: peak.idx };
}

/** Cross-dock utilization efficiency */
export function crossDockEfficiency(
    inboundTrucksPerDay: number,
    outboundTrucksPerDay: number,
    dockDoors: number,
    avgTurnTimeMinutes: number
): { utilizationPct: number; trucksPerDoorPerDay: number; bottleneck: boolean } {
    const totalTrucks = inboundTrucksPerDay + outboundTrucksPerDay;
    const minutesPerDay = dockDoors * 1440;
    const avgTimePerTruck = avgTurnTimeMinutes;
    const capacity = dockDoors > 0 ? minutesPerDay / avgTimePerTruck : 0;
    return {
        utilizationPct: capacity > 0 ? (totalTrucks / capacity) * 100 : 0,
        trucksPerDoorPerDay: dockDoors > 0 ? totalTrucks / dockDoors : 0,
        bottleneck: totalTrucks > capacity
    };
}

/** Fuel quality degradation over storage time */
export function fuelDegradation(
    initialQuality: { ron: number; rvpPsi: number; oxidationStabilityMin: number },
    storageDays: number,
    avgTemperatureF: number
): { finalRON: number; finalRVP: number; remainingStability: number; requiresRetreatment: boolean } {
    const degradationRate = Math.exp((avgTemperatureF - 60) / 50) * 0.05;
    const ronLoss = degradationRate * storageDays * 0.02;
    const rvpLoss = degradationRate * storageDays * 0.01;
    const stabilityLoss = degradationRate * storageDays * 5;
    return {
        finalRON: initialQuality.ron - ronLoss,
        finalRVP: initialQuality.rvpPsi - rvpLoss,
        remainingStability: Math.max(0, initialQuality.oxidationStabilityMin - stabilityLoss),
        requiresRetreatment: (initialQuality.oxidationStabilityMin - stabilityLoss) < 240
    };
}
