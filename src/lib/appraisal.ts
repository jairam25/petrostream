// ====================================================================
// APPRAISAL DECISION GATE & CONCEPT SELECTION — Sub-Step 2.7
// Industrial-grade calculations for reserves classification,
// development concept economics, Monte Carlo simulation, and FDP
// ====================================================================

// -------------------------------------------------------------------
// SPE-PRMS Reserves Classification
// -------------------------------------------------------------------
export interface ReservesEstimate {
  p90: number;
  p50: number;
  p10: number;
  mean: number;
}

export interface ReservesCategory {
  proved1P: number;          // P90
  provedProbable2P: number;   // P50
  provedProbablePossible3P: number; // P10
  contingentResources: number;
}

export function classifyReserves(
  volumesP90: number,
  volumesP50: number,
  volumesP10: number,
  recoveryFactorP90: number,
  recoveryFactorP50: number,
  recoveryFactorP10: number
): ReservesCategory {
  const proved1P = volumesP90 * (recoveryFactorP90 / 100);
  const provedProbable2P = volumesP50 * (recoveryFactorP50 / 100);
  const provedProbablePossible3P = volumesP10 * (recoveryFactorP10 / 100);
  return {
    proved1P,
    provedProbable2P,
    provedProbablePossible3P,
    contingentResources: provedProbablePossible3P - proved1P,
  };
}

// -------------------------------------------------------------------
// Development Well Count Estimation
// -------------------------------------------------------------------
export interface WellCountConfig {
  drainageAreaAcresPerWell: number;
  totalFieldAcres: number;
  injectorProducerRatio: number;  // e.g. 0.5 = 1 injector per 2 producers
  wellSpacingFeet: number;
  patternType: '5spot' | '7spot' | '9spot' | 'line_drive' | 'irregular';
}

export function estimateWellCount(config: WellCountConfig): {
  totalProducers: number;
  totalInjectors: number;
  totalWells: number;
  wellsPerRow: number;
  rows: number;
} {
  const areaSqFeet = config.totalFieldAcres * 43560;
  const wellsFromSpacing = areaSqFeet / (config.wellSpacingFeet * config.wellSpacingFeet);
  const wellsFromDrainage = config.totalFieldAcres / config.drainageAreaAcresPerWell;

  const totalProducers = Math.ceil(Math.max(wellsFromSpacing, wellsFromDrainage, 1));

  let ratio = 0;
  switch (config.patternType) {
    case '5spot': ratio = 1.0; break;
    case '7spot': ratio = 2.0; break;
    case '9spot': ratio = 3.0; break;
    case 'line_drive': ratio = 1.0; break;
    case 'irregular': ratio = config.injectorProducerRatio; break;
  }

  const totalInjectors = Math.ceil(totalProducers * ratio * config.injectorProducerRatio);
  const sqrtProducers = Math.ceil(Math.sqrt(totalProducers));

  return {
    totalProducers,
    totalInjectors,
    totalWells: totalProducers + totalInjectors,
    wellsPerRow: sqrtProducers,
    rows: Math.ceil(totalProducers / sqrtProducers),
  };
}

// -------------------------------------------------------------------
// Production Profile Generation (Build-up, Plateau, Decline)
// -------------------------------------------------------------------
export interface ProductionProfileParams {
  recoverableReservesMMbbl: number;
  plateauRateBopd: number;
  rampUpDurationYears: number;
  plateauDurationYears: number;
  declineRateAnnual: number;       // fractional, e.g. 0.12 = 12%
  declineType: 'exponential' | 'hyperbolic' | 'harmonic';
  hyperbolicB: number;             // b-factor for hyperbolic decline (0-1)
  minimumEconomicRateBopd: number;
  fieldLifeMaxYears: number;
  downtimeFactor: number;          // e.g. 0.92 = 92% uptime
}

export interface ProductionProfile {
  years: number[];
  rates: number[];
  cumulative: number[];
  fieldLifeYears: number;
  ultimateRecoveryMMbbl: number;
  peakRateBopd: number;
  plateauRateActual: number;
}

export function generateProductionProfile(params: ProductionProfileParams): ProductionProfile {
  const {
    recoverableReservesMMbbl,
    plateauRateBopd,
    rampUpDurationYears,
    plateauDurationYears,
    declineRateAnnual,
    declineType,
    hyperbolicB,
    minimumEconomicRateBopd,
    fieldLifeMaxYears,
    downtimeFactor,
  } = params;

  const actualPlateau = plateauRateBopd * downtimeFactor;
  const years: number[] = [];
  const rates: number[] = [];
  const cumulative: number[] = [];

  let cum = 0;
  const annualDays = 365.25 * downtimeFactor;

  // Ramp-up phase
  const rampSteps = Math.max(1, Math.floor(rampUpDurationYears));
  for (let yr = 1; yr <= rampSteps; yr++) {
    const frac = yr / Math.max(1, rampUpDurationYears);
    const rate = actualPlateau * (frac * frac * (3 - 2 * frac)); // smooth S-curve ramp
    years.push(yr);
    rates.push(rate);
    cum += rate * annualDays / 1e6;
    cumulative.push(cum);
  }

  // Plateau phase
  for (let yr = rampSteps + 1; yr <= rampSteps + Math.floor(plateauDurationYears); yr++) {
    years.push(yr);
    rates.push(actualPlateau);
    cum += actualPlateau * annualDays / 1e6;
    cumulative.push(cum);
  }

  // Decline phase
  let currentRate = actualPlateau;
  const declineStartYear = rampSteps + Math.floor(plateauDurationYears);
  let declineYear = 1;
  const maxDeclineYears = fieldLifeMaxYears - declineStartYear;

  for (let d = 1; d <= maxDeclineYears; d++) {
    let newRate: number;

    switch (declineType) {
      case 'exponential':
        newRate = currentRate * Math.exp(-declineRateAnnual * d);
        break;
      case 'hyperbolic':
        newRate = currentRate / Math.pow(1 + hyperbolicB * declineRateAnnual * d, 1 / Math.max(0.01, hyperbolicB));
        break;
      case 'harmonic':
        newRate = currentRate / (1 + declineRateAnnual * d);
        break;
      default:
        newRate = currentRate;
    }

    if (newRate < minimumEconomicRateBopd || cum >= recoverableReservesMMbbl * 0.995) {
      // Economic limit reached
      if (newRate < minimumEconomicRateBopd) {
        const tailYearRate = Math.max(minimumEconomicRateBopd, newRate);
        years.push(declineStartYear + d);
        rates.push(tailYearRate);
        cum += tailYearRate * annualDays / 1e6;
        cumulative.push(Math.min(cum, recoverableReservesMMbbl));
      }
      break;
    }

    years.push(declineStartYear + d);
    rates.push(newRate);
    cum += newRate * annualDays / 1e6;
    cumulative.push(Math.min(cum, recoverableReservesMMbbl));
    currentRate = newRate;
    declineYear++;

    if (cum >= recoverableReservesMMbbl * 0.995) break;
  }

  return {
    years,
    rates,
    cumulative,
    fieldLifeYears: years[years.length - 1],
    ultimateRecoveryMMbbl: cumulative[cumulative.length - 1],
    peakRateBopd: actualPlateau,
    plateauRateActual: actualPlateau,
  };
}

// -------------------------------------------------------------------
// CAPEX Estimation
// -------------------------------------------------------------------
export interface CAPEXConfig {
  // Well costs
  producerWellCostMM: number;       // per well
  injectorWellCostMM: number;       // per well
  numberOfProducers: number;
  numberOfInjectors: number;

  // Facilities
  facilityType: 'onshore_cpf' | 'offshore_platform' | 'fpso' | 'subsea_tieback' | 'tlp' | 'spar' | 'semi_submersible';
  processingCapacityBopd: number;
  waterInjectionCapacityBwpd: number;
  gasCompressionMMscfd: number;

  // Infrastructure
  pipelineLengthKm: number;
  pipelineDiameterInches: number;
  exportTerminalCostMM: number;

  // Indirect
  engineeringPercentOfDirect: number;  // e.g. 15 = 15%
  contingencyPercentOfTotal: number;    // e.g. 20 = 20%
  ownerCostsPercent: number;            // e.g. 5 = 5%
}

export interface CAPEXBreakdown {
  drillingCompletionsMM: number;
  facilitiesMM: number;
  subseaUmbilicalsMM: number;
  pipelinesExportMM: number;
  otherDirectMM: number;
  totalDirectMM: number;
  engineeringMM: number;
  contingencyMM: number;
  ownerCostsMM: number;
  totalCAPEXMM: number;
  capexPerPeakBarrel: number;
}

export function estimateCAPEX(config: CAPEXConfig): CAPEXBreakdown {
  const drillingCompletionsMM =
    config.numberOfProducers * config.producerWellCostMM +
    config.numberOfInjectors * config.injectorWellCostMM;

  // Facility cost models (industry rule-of-thumb scaling)
  const facilityBaseCost: Record<string, (capacity: number) => number> = {
    onshore_cpf: (c) => 80 * Math.pow(c / 50000, 0.6),
    offshore_platform: (c) => 450 * Math.pow(c / 100000, 0.65),
    fpso: (c) => 600 * Math.pow(c / 100000, 0.7),
    subsea_tieback: (c) => 300 * Math.pow(c / 50000, 0.6),
    tlp: (c) => 350 * Math.pow(c / 100000, 0.7),
    spar: (c) => 400 * Math.pow(c / 100000, 0.7),
    semi_submersible: (c) => 500 * Math.pow(c / 100000, 0.7),
  };

  const baseFn = facilityBaseCost[config.facilityType] || facilityBaseCost.onshore_cpf;
  const facilitiesMM = baseFn(config.processingCapacityBopd);
  const waterInjMM = config.waterInjectionCapacityBwpd > 0
    ? 30 * Math.pow(config.waterInjectionCapacityBwpd / 50000, 0.5)
    : 0;
  const gasCompMM = config.gasCompressionMMscfd > 0
    ? 15 * Math.pow(config.gasCompressionMMscfd / 50, 0.5)
    : 0;

  const pipelinesExportMM = config.pipelineLengthKm > 0
    ? config.pipelineLengthKm * (0.05 + 0.008 * config.pipelineDiameterInches)
    : 0;

  const subseaUmbilicalsMM = config.facilityType === 'subsea_tieback'
    ? config.pipelineLengthKm * 1.5
    : 0;

  const otherDirectMM = config.exportTerminalCostMM;
  const totalDirectMM = drillingCompletionsMM + facilitiesMM + waterInjMM +
    gasCompMM + pipelinesExportMM + subseaUmbilicalsMM + otherDirectMM;

  const engineeringMM = totalDirectMM * (config.engineeringPercentOfDirect / 100);
  const subtotal = totalDirectMM + engineeringMM;
  const contingencyMM = subtotal * (config.contingencyPercentOfTotal / 100);
  const ownerCostsMM = (subtotal + contingencyMM) * (config.ownerCostsPercent / 100);
  const totalCAPEXMM = subtotal + contingencyMM + ownerCostsMM;

  return {
    drillingCompletionsMM,
    facilitiesMM: facilitiesMM + waterInjMM + gasCompMM,
    subseaUmbilicalsMM,
    pipelinesExportMM,
    otherDirectMM,
    totalDirectMM,
    engineeringMM,
    contingencyMM,
    ownerCostsMM,
    totalCAPEXMM,
    capexPerPeakBarrel: config.processingCapacityBopd > 0
      ? totalCAPEXMM / config.processingCapacityBopd
      : 0,
  };
}

// -------------------------------------------------------------------
// OPEX Estimation
// -------------------------------------------------------------------
export interface OPEXConfig {
  fixedOpexMMPerYear: number;      // base fixed cost
  variableOpexPerBbl: number;       // $/bbl
  wellOpexPerWellPerYear: number;   // $/well/year
  numberOfWells: number;
  waterHandlingCostPerBbl: number;
  gasProcessingCostPerMscf: number;
}

export function estimateAnnualOPEX(
  config: OPEXConfig,
  annualProductionBbl: number,
  annualWaterBbl: number,
  annualGasMscf: number
): number {
  const variable = annualProductionBbl * config.variableOpexPerBbl;
  const wellOpex = config.numberOfWells * config.wellOpexPerWellPerYear;
  const waterHandling = annualWaterBbl * config.waterHandlingCostPerBbl;
  const gasProc = annualGasMscf * config.gasProcessingCostPerMscf;
  return config.fixedOpexMMPerYear + variable + wellOpex + waterHandling + gasProc;
}

// -------------------------------------------------------------------
// Fiscal Regime & Cash Flow
// -------------------------------------------------------------------
export interface FiscalTerms {
  royaltyRate: number;             // fraction, e.g. 0.125 = 12.5%
  incomeTaxRate: number;           // fraction
  costRecoveryCeiling: number;     // fraction of gross revenue that can be cost-recovered (PSC)
  profitOilSplitGovt: number;      // government share of profit oil (PSC)
  isConcession: boolean;           // true = concession (tax/royalty), false = PSC
  depreciationYears: number;       // straight-line depreciation
  abandonmentCostMM: number;       // total abandonment cost
  abandonmentYear: number;         // year incurred
  indirectTaxPercent: number;      // e.g. VAT, property tax
  bonusPaymentMM: number;          // signature/production bonus
  bonusYear: number;
}

export interface AnnualCashFlow {
  year: number;
  grossRevenueMM: number;
  royaltyMM: number;
  netRevenueMM: number;
  opexMM: number;
  costRecoveryMM: number;
  profitOilGovtMM: number;
  profitOilContractorMM: number;
  taxableIncomeMM: number;
  incomeTaxMM: number;
  capexMM: number;
  indirectTaxMM: number;
  abandonmentMM: number;
  bonusMM: number;
  freeCashFlowMM: number;
  cumulativeCashFlowMM: number;
  discountedCashFlowMM: number;
}

export interface CashFlowResult {
  annualFlows: AnnualCashFlow[];
  npvAt10: number;
  npvAt15: number;
  irr: number;
  paybackYears: number;
  discountedPaybackYears: number;
  profitabilityIndex: number;
  maximumExposureMM: number;
}

export function runCashFlow(
  productionProfile: ProductionProfile,
  oilPricePerBbl: number,
  capexBreakdown: CAPEXBreakdown,
  opexConfig: OPEXConfig,
  fiscalTerms: FiscalTerms,
  capexPhasing: number[],  // fraction per year, length = build years
  gasOilRatioScfPerBbl: number,
  waterCut: number[],       // fraction per year, aligned with profile
  gasPricePerMscf: number
): CashFlowResult {
  const flows: AnnualCashFlow[] = [];
  const discountRate10 = 0.10;
  const discountRate15 = 0.15;
  const { years, rates, cumulative } = productionProfile;
  const nYears = years.length;

  let cumCF = 0;
  let cumDCF10 = 0;
  let cumDCF15 = 0;
  let maxExposure = 0;
  let paybackFound = false;
  let discPaybackFound = false;
  let paybackYear = -1;
  let discPaybackYear = -1;

  for (let i = 0; i < Math.max(nYears, 30); i++) {
    const yr = i < nYears ? years[i] : nYears > 0 ? years[nYears - 1] + (i - nYears + 1) : i + 1;
    const oilRate = i < nYears ? rates[i] : 0;
    const annualOilBbl = oilRate * 365.25;
    const annualGasMscf = annualOilBbl * gasOilRatioScfPerBbl / 1000;
    const wc = i < waterCut.length ? waterCut[i] : (waterCut.length > 0 ? waterCut[waterCut.length - 1] : 0);
    const annualWaterBbl = wc > 0 ? annualOilBbl * wc / (1 - Math.min(0.99, wc)) : 0;

    // Revenue
    const oilRevenue = annualOilBbl * oilPricePerBbl;
    const gasRevenue = annualGasMscf * gasPricePerMscf;
    const grossRevenueMM = (oilRevenue + gasRevenue) / 1e6;

    // Royalty
    const royaltyMM = grossRevenueMM * fiscalTerms.royaltyRate;
    const netRevenueMM = grossRevenueMM - royaltyMM;

    // OPEX
    const opexMM = estimateAnnualOPEX(opexConfig, annualOilBbl, annualWaterBbl, annualGasMscf) / 1e6;

    // CAPEX
    const capexMM = i < capexPhasing.length
      ? capexBreakdown.totalCAPEXMM * capexPhasing[i]
      : 0;

    // Bonus
    const bonusMM = i + 1 === fiscalTerms.bonusYear ? fiscalTerms.bonusPaymentMM : 0;

    // Depreciation
    const depreciationMM = fiscalTerms.depreciationYears > 0
      ? Math.min(capexBreakdown.totalCAPEXMM / fiscalTerms.depreciationYears, netRevenueMM - opexMM)
      : 0;

    let costRecoveryMM = 0;
    let profitOilGovtMM = 0;
    let profitOilContractorMM = 0;
    let taxableIncomeMM = 0;
    let incomeTaxMM = 0;

    if (fiscalTerms.isConcession) {
      taxableIncomeMM = netRevenueMM - opexMM - depreciationMM - bonusMM;
      if (yr === fiscalTerms.abandonmentYear) taxableIncomeMM -= fiscalTerms.abandonmentCostMM;
      taxableIncomeMM = Math.max(0, taxableIncomeMM);
      incomeTaxMM = taxableIncomeMM * fiscalTerms.incomeTaxRate;
      profitOilContractorMM = netRevenueMM - opexMM - incomeTaxMM;
    } else {
      // PSC
      costRecoveryMM = Math.min(
        opexMM + depreciationMM,
        grossRevenueMM * fiscalTerms.costRecoveryCeiling
      );
      const profitOil = netRevenueMM - costRecoveryMM;
      profitOilGovtMM = profitOil * fiscalTerms.profitOilSplitGovt;
      profitOilContractorMM = profitOil * (1 - fiscalTerms.profitOilSplitGovt);
      taxableIncomeMM = profitOilContractorMM;
      incomeTaxMM = taxableIncomeMM * fiscalTerms.incomeTaxRate;
    }

    const indirectTaxMM = grossRevenueMM * (fiscalTerms.indirectTaxPercent / 100);
    const abandonmentMM = yr === fiscalTerms.abandonmentYear ? fiscalTerms.abandonmentCostMM : 0;

    const fcf = profitOilContractorMM - capexMM - indirectTaxMM - abandonmentMM - bonusMM;
    cumCF += fcf;

    const df10 = fcf / Math.pow(1 + discountRate10, yr);
    const df15 = fcf / Math.pow(1 + discountRate15, yr);
    cumDCF10 += df10;
    cumDCF15 += df15;

    if (cumCF < maxExposure) maxExposure = cumCF;
    if (!paybackFound && cumCF >= 0) {
      paybackYear = yr;
      paybackFound = true;
    }
    if (!discPaybackFound && cumDCF10 >= 0) {
      discPaybackYear = yr;
      discPaybackFound = true;
    }

    flows.push({
      year: yr,
      grossRevenueMM,
      royaltyMM,
      netRevenueMM,
      opexMM,
      costRecoveryMM,
      profitOilGovtMM,
      profitOilContractorMM,
      taxableIncomeMM,
      incomeTaxMM,
      capexMM,
      indirectTaxMM,
      abandonmentMM,
      bonusMM,
      freeCashFlowMM: fcf,
      cumulativeCashFlowMM: cumCF,
      discountedCashFlowMM: cumDCF10,
    });

    if (yr >= 30) break;
  }

  // Calculate IRR via Newton-Raphson
  function npvAtRate(rate: number): number {
    let npv = 0;
    for (const f of flows) {
      npv += f.freeCashFlowMM / Math.pow(1 + rate, f.year);
    }
    return npv;
  }

  let irrGuess = 0.15;
  for (let iter = 0; iter < 100; iter++) {
    const npv = npvAtRate(irrGuess);
    const deriv = (npvAtRate(irrGuess + 0.0001) - npv) / 0.0001;
    if (Math.abs(deriv) < 1e-12) break;
    const newGuess = irrGuess - npv / deriv;
    if (Math.abs(newGuess - irrGuess) < 1e-6) {
      irrGuess = newGuess;
      break;
    }
    irrGuess = Math.max(-0.5, Math.min(2.0, newGuess));
  }

  const totalDiscountedCAPEX = flows.reduce((sum, f) => {
    return sum + f.capexMM / Math.pow(1 + discountRate10, f.year);
  }, 0);

  return {
    annualFlows: flows,
    npvAt10: cumDCF10,
    npvAt15: cumDCF15,
    irr: irrGuess * 100,
    paybackYears: paybackFound ? paybackYear : -1,
    discountedPaybackYears: discPaybackFound ? discPaybackYear : -1,
    profitabilityIndex: totalDiscountedCAPEX > 0
      ? (cumDCF10 + totalDiscountedCAPEX) / totalDiscountedCAPEX
      : 0,
    maximumExposureMM: Math.abs(maxExposure),
  };
}

// -------------------------------------------------------------------
// Monte Carlo Simulation for Economics
// -------------------------------------------------------------------
export interface MonteCarloInput {
  name: string;
  distribution: 'triangular' | 'normal' | 'lognormal' | 'uniform';
  min?: number;
  max?: number;
  mostLikely?: number;
  mean?: number;
  stdDev?: number;
  low?: number;
  high?: number;
}

export interface MonteCarloResult {
  npvMean: number;
  npvStdDev: number;
  npvP10: number;
  npvP50: number;
  npvP90: number;
  irrMean: number;
  irrP10: number;
  irrP50: number;
  irrP90: number;
  probabilityNpvPositive: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
  allNpvs: number[];
  allIrrs: number[];
}

function triangularSample(min: number, max: number, mode: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

function normalSample(mean: number, stdDev: number): number {
  // Box-Muller
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12))) * Math.cos(2 * Math.PI * u2);
}

function lognormalSample(mean: number, stdDev: number): number {
  const mu = Math.log(mean * mean / Math.sqrt(mean * mean + stdDev * stdDev));
  const sigma = Math.sqrt(Math.log(1 + (stdDev * stdDev) / (mean * mean)));
  return Math.exp(normalSample(mu, sigma));
}

function sampleInput(input: MonteCarloInput): number {
  switch (input.distribution) {
    case 'triangular':
      return triangularSample(input.min!, input.max!, input.mostLikely!);
    case 'normal':
      return normalSample(input.mean!, input.stdDev!);
    case 'lognormal':
      return lognormalSample(input.mean!, input.stdDev!);
    case 'uniform':
      return input.low! + Math.random() * (input.high! - input.low!);
    default:
      return input.mostLikely || 0;
  }
}

export function runMonteCarlo(
  iterations: number,
  inputs: MonteCarloInput[],
  baseCaseParams: {
    productionProfile: ProductionProfile;
    oilPrice: number;
    capexConfig: CAPEXConfig;
    opexConfig: OPEXConfig;
    fiscalTerms: FiscalTerms;
    capexPhasing: number[];
    gor: number;
    waterCut: number[];
    gasPrice: number;
  },
  sensitivityMap: Record<string, (params: typeof baseCaseParams, value: number) => void>
): MonteCarloResult {
  const allNpvs: number[] = [];
  const allIrrs: number[] = [];
  let positiveCount = 0;

  for (let i = 0; i < iterations; i++) {
    const sampledParams = JSON.parse(JSON.stringify(baseCaseParams));

    for (const inp of inputs) {
      const sampledValue = sampleInput(inp);
      if (sensitivityMap[inp.name]) {
        sensitivityMap[inp.name](sampledParams, sampledValue);
      }
    }

    const capex = estimateCAPEX(sampledParams.capexConfig);
    const result = runCashFlow(
      sampledParams.productionProfile,
      sampledParams.oilPrice,
      capex,
      sampledParams.opexConfig,
      sampledParams.fiscalTerms,
      sampledParams.capexPhasing,
      sampledParams.gor,
      sampledParams.waterCut,
      sampledParams.gasPrice
    );

    allNpvs.push(result.npvAt10);
    allIrrs.push(result.irr);
    if (result.npvAt10 > 0) positiveCount++;
  }

  // Sort for percentiles
  const sortedNpv = [...allNpvs].sort((a, b) => a - b);
  const sortedIrr = [...allIrrs].sort((a, b) => a - b);

  const p10Idx = Math.floor(iterations * 0.1);
  const p50Idx = Math.floor(iterations * 0.5);
  const p90Idx = Math.floor(iterations * 0.9);

  // Histogram
  const npvMin = sortedNpv[0];
  const npvMax = sortedNpv[sortedNpv.length - 1];
  const binCount = 20;
  const binWidth = (npvMax - npvMin) / binCount || 1;
  const histogram: MonteCarloResult['histogram'] = [];

  for (let b = 0; b < binCount; b++) {
    const binStart = npvMin + b * binWidth;
    const binEnd = binStart + binWidth;
    const count = allNpvs.filter(v => v >= binStart && (b === binCount - 1 ? v <= binEnd : v < binEnd)).length;
    histogram.push({ binStart, binEnd, count });
  }

  const npvMean = allNpvs.reduce((s, v) => s + v, 0) / iterations;
  const npvVariance = allNpvs.reduce((s, v) => s + (v - npvMean) ** 2, 0) / iterations;

  return {
    npvMean,
    npvStdDev: Math.sqrt(npvVariance),
    npvP10: sortedNpv[p10Idx],
    npvP50: sortedNpv[p50Idx],
    npvP90: sortedNpv[p90Idx],
    irrMean: allIrrs.reduce((s, v) => s + v, 0) / iterations,
    irrP10: sortedIrr[p10Idx],
    irrP50: sortedIrr[p50Idx],
    irrP90: sortedIrr[p90Idx],
    probabilityNpvPositive: (positiveCount / iterations) * 100,
    histogram,
    allNpvs,
    allIrrs,
  };
}

// -------------------------------------------------------------------
// Decision Tree / Concept Comparison
// -------------------------------------------------------------------
export interface DevelopmentConcept {
  id: string;
  name: string;
  facilityType: CAPEXConfig['facilityType'];
  npvMM: number;
  irr: number;
  paybackYears: number;
  capexMM: number;
  opexPerBbl: number;
  peakRateBopd: number;
  plateauYears: number;
  recoveryFactor: number;
  totalWells: number;
  riskScore: number; // 1-10, lower = less risk
}

export function compareConcepts(concepts: DevelopmentConcept[]): DevelopmentConcept[] {
  return [...concepts].sort((a, b) => b.npvMM - a.npvMM);
}

// -------------------------------------------------------------------
// Development Concept Screening
// -------------------------------------------------------------------
export interface ConceptScreeningInputs {
  waterDepthM: number;
  distanceToInfrastructureKm: number;
  fieldSizeMMboe: number;
  peakRateBopd: number;
  reservoirDepthFt: number;
  h2sContentPpm: number;
  co2ContentPercent: number;
  environmentalSensitivity: 'low' | 'moderate' | 'high';
}

export function screenDevelopmentConcepts(inputs: ConceptScreeningInputs): {
  viableConcepts: Array<{ type: CAPEXConfig['facilityType']; score: number; reason: string }>;
} {
  const viable: Array<{ type: CAPEXConfig['facilityType']; score: number; reason: string }> = [];

  const addIf = (type: CAPEXConfig['facilityType'], score: number, condition: boolean, reason: string) => {
    if (condition) viable.push({ type, score, reason });
  };

  addIf('onshore_cpf', 10, inputs.waterDepthM <= 5, 'Shallow/onshore — lowest cost option');
  addIf('offshore_platform', 7, inputs.waterDepthM > 5 && inputs.waterDepthM < 500 && inputs.fieldSizeMMboe > 100, 'Shallow-to-mid water, large field');
  addIf('subsea_tieback', 6, inputs.distanceToInfrastructureKm < 50 && inputs.fieldSizeMMboe < 200, 'Near existing infrastructure');
  addIf('fpso', 8, inputs.waterDepthM > 100 && inputs.environmentalSensitivity !== 'high', 'Deepwater, mobile solution');
  addIf('tlp', 5, inputs.waterDepthM > 300 && inputs.waterDepthM < 1500 && inputs.fieldSizeMMboe > 200, 'Ultra-deepwater tension leg platform');
  addIf('spar', 5, inputs.waterDepthM > 500 && inputs.waterDepthM < 3000, 'Deep-draft spar for ultra-deepwater');
  addIf('semi_submersible', 4, inputs.waterDepthM > 200 && inputs.environmentalSensitivity === 'high', 'Semi-sub for harsh environments');

  return {
    viableConcepts: viable.sort((a, b) => b.score - a.score),
  };
}

// -------------------------------------------------------------------
// Tornado Chart Data (Sensitivity Analysis)
// -------------------------------------------------------------------
export interface TornadoItem {
  parameter: string;
  lowValue: number;
  highValue: number;
  lowNpv: number;
  highNpv: number;
  range: number;
  unit: string;
}

export function buildTornadoData(
  baseNpv: number,
  sensitivities: Array<{
    parameter: string;
    lowMultiplier: number;
    highMultiplier: number;
    unit: string;
    applyToCashFlow: (multiplier: number) => number; // returns NPV
  }>
): TornadoItem[] {
  return sensitivities
    .map(s => {
      const lowNpv = s.applyToCashFlow(s.lowMultiplier);
      const highNpv = s.applyToCashFlow(s.highMultiplier);
      return {
        parameter: s.parameter,
        lowValue: s.lowMultiplier,
        highValue: s.highMultiplier,
        lowNpv,
        highNpv,
        range: Math.abs(highNpv - lowNpv),
        unit: s.unit,
      };
    })
    .sort((a, b) => b.range - a.range);
}

// -------------------------------------------------------------------
// Recovery Factor Estimation
// -------------------------------------------------------------------
export function estimateRecoveryFactor(
  driveMechanism: 'depletion' | 'water_drive' | 'gas_cap' | 'combination' | 'waterflood' | 'gas_injection' | 'wAG' | 'thermal' | 'chemical',
  permeabilityMd: number,
  porosityFraction: number,
  oilViscosityCp: number,
  apiGravity: number
): { primary: number; secondary: number; tertiary: number; total: number } {
  let primary = 0;
  let secondary = 0;
  let tertiary = 0;

  // Primary recovery (rule-of-thumb correlations)
  switch (driveMechanism) {
    case 'depletion':
      primary = 5 + (permeabilityMd > 100 ? 10 : 5);
      break;
    case 'water_drive':
      primary = 20 + (permeabilityMd > 500 ? 15 : 10);
      break;
    case 'gas_cap':
      primary = 25 + (permeabilityMd > 200 ? 10 : 5);
      break;
    case 'combination':
      primary = 30 + (permeabilityMd > 200 ? 10 : 5);
      break;
    default:
      primary = 15;
  }

  // Viscosity adjustment
  if (oilViscosityCp > 10) primary *= 0.6;
  else if (oilViscosityCp > 5) primary *= 0.8;
  else if (oilViscosityCp < 1) primary *= 1.15;

  // Secondary (waterflood)
  if (['water_drive', 'waterflood', 'combination', 'wAG', 'chemical'].includes(driveMechanism)) {
    secondary = 10 + (permeabilityMd > 50 ? 10 : 2);
    if (oilViscosityCp > 10) secondary *= 0.5;
  }

  // Tertiary
  if (driveMechanism === 'wAG') tertiary = 5;
  if (driveMechanism === 'thermal') tertiary = 15 + (apiGravity < 20 ? 15 : 5);
  if (driveMechanism === 'chemical') tertiary = 8 + (oilViscosityCp < 50 ? 7 : 2);

  const total = Math.min(65, primary + secondary + tertiary);

  return { primary, secondary, tertiary, total };
}

// -------------------------------------------------------------------
// Artificial Lift Screening
// -------------------------------------------------------------------
export function screenArtificialLift(params: {
  wellDepthFt: number;
  productivityIndexBpdPerPsi: number;
  gorScfPerBbl: number;
  oilViscosityCp: number;
  waterCut: number;
  sandProduction: 'none' | 'low' | 'moderate' | 'high';
  wellDeviationDeg: number;
  availabilityOfGasLift: boolean;
  availabilityOfPower: boolean;
}): Array<{ type: string; score: number; applicability: string }> {
  const results: Array<{ type: string; score: number; applicability: string }> = [];

  // ESP
  let espScore = 8;
  if (params.wellDepthFt > 12000) espScore -= 2;
  if (params.gorScfPerBbl > 2000) espScore -= 3;
  if (params.sandProduction === 'high') espScore -= 2;
  if (params.wellDeviationDeg > 60) espScore -= 1;
  if (params.oilViscosityCp > 200) espScore -= 2;
  if (espScore >= 5) results.push({ type: 'ESP', score: espScore, applicability: 'High rate, low GOR, vertical to moderate deviation' });

  // Gas Lift
  let glScore = 7;
  if (!params.availabilityOfGasLift) glScore -= 5;
  if (params.wellDepthFt > 15000) glScore -= 2;
  if (params.waterCut > 90) glScore -= 1;
  if (params.sandProduction === 'high') glScore += 1; // tolerates sand
  if (params.wellDeviationDeg > 60) glScore += 1; // good for deviated
  if (glScore >= 5) results.push({ type: 'Gas Lift', score: glScore, applicability: 'High GOR, deviated wells, sand tolerant' });

  // Rod Pump
  let rpScore = 6;
  if (params.wellDepthFt > 10000) rpScore -= 3;
  if (params.wellDeviationDeg > 30) rpScore -= 2;
  if (params.sandProduction === 'high') rpScore -= 1;
  if (params.productivityIndexBpdPerPsi < 5) rpScore += 2;
  if (rpScore >= 5) results.push({ type: 'Rod Pump', score: rpScore, applicability: 'Shallow to medium depth, low-moderate rate' });

  // PCP
  let pcpScore = 6;
  if (params.wellDepthFt > 8000) pcpScore -= 2;
  if (params.oilViscosityCp < 10 || params.oilViscosityCp > 5000) pcpScore -= 1;
  if (params.gorScfPerBbl > 500) pcpScore -= 2;
  if (params.sandProduction === 'high') pcpScore += 1;
  if (pcpScore >= 5) results.push({ type: 'PCP', score: pcpScore, applicability: 'Heavy oil, sand tolerant, moderate depth' });

  // Jet Pump
  let jpScore = 5;
  if (params.wellDepthFt > 15000) jpScore -= 1;
  if (params.wellDeviationDeg > 70) jpScore += 1;
  if (jpScore >= 5) results.push({ type: 'Jet Pump', score: jpScore, applicability: 'Deviated wells, remote locations' });

  // Plunger Lift
  let plScore = 4;
  if (params.gorScfPerBbl < 500) plScore -= 1;
  if (plScore >= 5) results.push({ type: 'Plunger Lift', score: plScore, applicability: 'Gas wells, liquid loading prevention' });

  return results.sort((a, b) => b.score - a.score);
}

// -------------------------------------------------------------------
// Field Life Estimation
// -------------------------------------------------------------------
export function estimateFieldLife(
  recoverableReservesMMbbl: number,
  peakRateBopd: number,
  downtimeFactor: number,
  declineRateAnnual: number
): { economicLifeYears: number; technicalLifeYears: number } {
  const effectivePeak = peakRateBopd * downtimeFactor;
  const avgRate = effectivePeak * 0.6; // rough average over life
  const annualProduction = avgRate * 365.25;
  const technicalLifeYears = recoverableReservesMMbbl * 1e6 / Math.max(1, annualProduction);
  const economicLifeYears = Math.min(technicalLifeYears, 30);
  return { economicLifeYears, technicalLifeYears };
}