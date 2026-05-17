/**
 * Basin Modeling & Petroleum Systems Library
 * Phase 1 — Exploration: Subsidence, Thermal History & Maturation
 *
 * Industrial-grade equations for backstripping, crustal stretching,
 * heat flow evolution, thermal maturity (Lopatin TTI / Easy%Ro),
 * hydrocarbon generation mass balance, and expulsion efficiency.
 *
 * References:
 *   - McKenzie (1978) — Crustal stretching & thermal subsidence
 *   - Steckler & Watts (1978) — Backstripping technique
 *   - Waples (1980) — Lopatin's Time-Temperature Index
 *   - Sweeney & Burnham (1990) — Easy%Ro kinetics
 *   - Tissot & Welte (1984) — Petroleum Formation & Occurrence
 *   - Pepper & Corvi (1995) — Generation kinetics by organofacies
 *   - Allen & Allen (2005) — Basin Analysis: Principles & Applications
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Single layer in a 1D burial-history column */
export interface StratigraphicLayer {
    name: string;
    topDepthM: number;          // present-day top (m below surface)
    baseDepthM: number;         // present-day base (m below surface)
    ageTopMa: number;           // age at top (Ma)
    ageBaseMa: number;          // age at base (Ma)
    lithology: 'sandstone' | 'shale' | 'carbonate' | 'salt' | 'siltstone' | 'conglomerate' | 'volcanic' | 'coal' | 'basement';
    porosityAtDeposition: number;
    grainDensityGcm3: number;   // ρ_g (g/cm³)
    /** Optional: TOC wt% for source-rock layers */
    tocWtPct?: number;
    /** Optional: original Hydrogen Index (mg HC / g TOC) */
    originalHI?: number;
    /** Organofacies for kinetics (Pepper & Corvi, 1995) */
    organofacies?: Organofacies;
}

/** Organofacies classification (Pepper & Corvi, 1995) */
export type Organofacies =
    | 'A'   // Marine, clay-poor — Type II
    | 'B'   // Marine, clay-rich — Type II/III
    | 'C'   // Lacustrine, fresh/brackish — Type I
    | 'D/E' // Terrestrial / coaly — Type III
    | 'F';  // Sulfur-rich — Type IIS

/** Burial-history event for plotting & calculations */
export interface BurialEvent {
    timeMa: number;
    depthM: number;
    temperatureC: number;
}

/** Subsidence decomposition (McKenzie-style) */
export interface SubsidenceComponents {
    totalSubsidenceM: number;
    tectonicSubsidenceM: number;
    thermalSubsidenceM: number;
    sedimentLoadingM: number;
}

/** Crustal stretching parameters */
export interface StretchingConfig {
    initialCrustalThicknessKm: number;       // tc⁰ (km)
    initialLithosphericThicknessKm: number;  // a (km)
    stretchingFactorBeta: number;            // β
    asthenosphereTempC: number;              // T₁ (default 1333°C)
    crustalDensityGcm3: number;              // ρ_c (2.78)
    mantleDensityGcm3: number;               // ρ_m (3.33)
    thermalExpansionCoeff: number;           // α (3.28e-5 /K)
    thermalDiffusivityM2s: number;           // κ (1e-6 m²/s)
}

/** Maturity model output */
export interface MaturityResult {
    vitriniteReflectanceRo: number;
    tti: number;
    transformationRatio: number;  // TR 0-1 (fraction of kerogen converted)
    presentDayTempC: number;
    peakTempC: number;
    oilWindowEnteredMa: number | null;
    gasWindowEnteredMa: number | null;
    generationRateMgPerGPerMyr: number;
    expelledHCMgPerGToc: number;
}

/** Hydrocarbon mass balance for one source-rock layer */
export interface GenerationMassBalance {
    originalTocWtPct: number;
    originalHIMgPerGToc: number;
    presentDayTocWtPct: number;
    presentDayHIMgPerGToc: number;
    generatedHCMgPerGRock: number;
    expelledHCMgPerGRock: number;
    retainedHCMgPerGRock: number;
    transformationRatio: number;
    expulsionEfficiency: number;
}

/** 1D burial-history model input */
export interface BurialHistoryInput {
    layers: StratigraphicLayer[];
    surfaceTempC: number;
    basalHeatFlowMwM2: number;         // present-day (mW/m²)
    timeSteps?: number;                 // default 200
}

/** 1D heat-flow history at a point */
export interface HeatFlowHistory {
    timeMa: number;
    heatFlowMwM2: number;
    basalTempC: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & LOOK-UP TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/** Default lithology properties: density, matrix thermal conductivity, compaction coeff */
export const LITHOLOGY_PROPS: Record<StratigraphicLayer['lithology'], {
    grainDensity: number;   // g/cm³
    conductivity: number;   // W/(m·K)
    compactionC: number;    // km⁻¹ (Athy's law)
    surfacePorosity: number;
}> = {
    sandstone: { grainDensity: 2.65, conductivity: 3.5, compactionC: 0.27, surfacePorosity: 0.49 },
    shale: { grainDensity: 2.72, conductivity: 1.5, compactionC: 0.51, surfacePorosity: 0.63 },
    carbonate: { grainDensity: 2.71, conductivity: 2.5, compactionC: 0.22, surfacePorosity: 0.45 },
    salt: { grainDensity: 2.16, conductivity: 5.4, compactionC: 0.0, surfacePorosity: 0.01 },
    siltstone: { grainDensity: 2.68, conductivity: 2.3, compactionC: 0.39, surfacePorosity: 0.56 },
    conglomerate: { grainDensity: 2.65, conductivity: 3.0, compactionC: 0.20, surfacePorosity: 0.40 },
    volcanic: { grainDensity: 2.90, conductivity: 2.0, compactionC: 0.10, surfacePorosity: 0.25 },
    coal: { grainDensity: 1.50, conductivity: 0.3, compactionC: 0.60, surfacePorosity: 0.70 },
    basement: { grainDensity: 2.80, conductivity: 3.0, compactionC: 0.01, surfacePorosity: 0.02 },
};

/** Organofacies kinetic parameters (Pepper & Corvi, 1995) — simplified single-Ea form */
export const ORGANOFACIES_KINETICS: Record<Organofacies, {
    aFactor: number;        // A (1/Ma)
    activationEnergyKjMol: number;
    oilWindowStartRo: number;
    oilWindowPeakRo: number;
    oilWindowEndRo: number;
    gasWindowStartRo: number;
    initialHI: number;
}> = {
    'A': { aFactor: 2.0e11, activationEnergyKjMol: 218, oilWindowStartRo: 0.55, oilWindowPeakRo: 0.82, oilWindowEndRo: 1.10, gasWindowStartRo: 1.10, initialHI: 600 },
    'B': { aFactor: 1.5e11, activationEnergyKjMol: 225, oilWindowStartRo: 0.60, oilWindowPeakRo: 0.85, oilWindowEndRo: 1.15, gasWindowStartRo: 1.15, initialHI: 450 },
    'C': { aFactor: 3.0e11, activationEnergyKjMol: 215, oilWindowStartRo: 0.50, oilWindowPeakRo: 0.78, oilWindowEndRo: 1.00, gasWindowStartRo: 1.00, initialHI: 750 },
    'D/E': { aFactor: 1.0e11, activationEnergyKjMol: 232, oilWindowStartRo: 0.65, oilWindowPeakRo: 0.90, oilWindowEndRo: 1.30, gasWindowStartRo: 1.20, initialHI: 300 },
    'F': { aFactor: 8.0e11, activationEnergyKjMol: 205, oilWindowStartRo: 0.42, oilWindowPeakRo: 0.68, oilWindowEndRo: 0.90, gasWindowStartRo: 0.90, initialHI: 650 },
};

/** Stretching model defaults */
export const DEFAULT_STRETCHING: StretchingConfig = {
    initialCrustalThicknessKm: 35,
    initialLithosphericThicknessKm: 125,
    stretchingFactorBeta: 1.5,
    asthenosphereTempC: 1333,
    crustalDensityGcm3: 2.78,
    mantleDensityGcm3: 3.33,
    thermalExpansionCoeff: 3.28e-5,
    thermalDiffusivityM2s: 1e-6,
};

// ═══════════════════════════════════════════════════════════════════════════════
// POROSITY–DEPTH & COMPACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Athy's law — exponential porosity decay with depth.
 * φ(z) = φ₀ · exp(−c·z)
 */
export function athyPorosity(
    depthKm: number,
    surfacePorosity: number,
    compactionCoeffPerKm: number,
): number {
    return surfacePorosity * Math.exp(-compactionCoeffPerKm * depthKm);
}

/**
 * De-compacted thickness of a layer at a past burial depth.
 * Skeletal thickness formula:
 *   y_s = ∫[z_top, z_base] (1 − φ(z)) dz
 */
export function decompactedThickness(
    presentTopKm: number,
    presentBaseKm: number,
    surfacePorosity: number,
    compactionCoeffPerKm: number,
): number {
    const c = compactionCoeffPerKm;
    const phi0 = surfacePorosity;
    const topIntegral = presentTopKm + (phi0 / c) * Math.exp(-c * presentTopKm);
    const baseIntegral = presentBaseKm + (phi0 / c) * Math.exp(-c * presentBaseKm);
    const skeletalThickness = (presentBaseKm - presentTopKm) - (baseIntegral - topIntegral) + phi0 * (presentBaseKm - presentTopKm);
    // Simplified: y_s ≈ ∫_top^base (1-φ) dz = (base-top) - phi0/c * (exp(-c*top) - exp(-c*base))
    const actualSkeletal = (presentBaseKm - presentTopKm) - (phi0 / c) * (Math.exp(-c * presentTopKm) - Math.exp(-c * presentBaseKm));
    return actualSkeletal;
}

/**
 * Backstripping: remove sediment load to isolate tectonic subsidence.
 * Uses Airy isostasy:
 *   Y = S · (ρ_m − ρ_s̄) / (ρ_m − ρ_w) + W_d − Δ_SL · ρ_m / (ρ_m − ρ_w)
 * where ρ_s̄ is average sediment density after decompaction.
 */
export function backstripSubsidence(
    layers: StratigraphicLayer[],
    waterDensityGcm3: number = 1.03,
    mantleDensityGcm3: number = 3.33,
): SubsidenceComponents {
    if (layers.length === 0) {
        return { totalSubsidenceM: 0, tectonicSubsidenceM: 0, thermalSubsidenceM: 0, sedimentLoadingM: 0 };
    }

    let totalSedimentLoad = 0;
    let totalSkeletalThicknessM = 0;

    for (const layer of layers) {
        const props = LITHOLOGY_PROPS[layer.lithology];
        const topKm = layer.topDepthM / 1000;
        const baseKm = layer.baseDepthM / 1000;
        const skel = decompactedThickness(topKm, baseKm, props.surfacePorosity, props.compactionC);
        totalSkeletalThicknessM += skel * 1000;

        // Average density of this layer accounting for porosity
        const avgPorosity = (athyPorosity(topKm, props.surfacePorosity, props.compactionC) +
            athyPorosity(baseKm, props.surfacePorosity, props.compactionC)) / 2;
        const bulkDensity = props.grainDensity * (1 - avgPorosity) + 1.03 * avgPorosity;
        const thicknessM = layer.baseDepthM - layer.topDepthM;
        totalSedimentLoad += bulkDensity * thicknessM;
    }

    // Average sediment density
    const totalThicknessM = layers[layers.length - 1].baseDepthM - layers[0].topDepthM;
    const avgSedimentDensity = totalThicknessM > 0 ? totalSedimentLoad / totalThicknessM : 2.5;

    // Tectonic subsidence (Airy isostasy, water-loaded)
    const tectonicSubsidenceM = totalSkeletalThicknessM *
        (mantleDensityGcm3 - avgSedimentDensity) / (mantleDensityGcm3 - waterDensityGcm3);

    const sedimentLoadingM = totalThicknessM - tectonicSubsidenceM;

    return {
        totalSubsidenceM: totalThicknessM,
        tectonicSubsidenceM: Math.round(tectonicSubsidenceM),
        thermalSubsidenceM: Math.round(tectonicSubsidenceM * 0.6), // approx for passive margins
        sedimentLoadingM: Math.round(sedimentLoadingM),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MCKENZIE (1978) CRUSTAL STRETCHING MODEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initial subsidence from instantaneous stretching.
 * S_i = a · { (ρ_m − ρ_c) · (t_c⁰ / a) · (1 − α_v·T₁·t_c⁰ / (2a)) −
 *            α_v·T₁·ρ_m / 2 } · (1 − 1/β) / (ρ_m − ρ_w)
 */
export function mckenzieInitialSubsidenceM(config: StretchingConfig): number {
    const { initialCrustalThicknessKm, initialLithosphericThicknessKm, stretchingFactorBeta,
        asthenosphereTempC, crustalDensityGcm3, mantleDensityGcm3, thermalExpansionCoeff } = config;

    const tc = initialCrustalThicknessKm;
    const a = initialLithosphericThicknessKm;
    const beta = stretchingFactorBeta;
    const T1 = asthenosphereTempC;
    const rho_c = crustalDensityGcm3;
    const rho_m = mantleDensityGcm3;
    const alpha = thermalExpansionCoeff;
    const rho_w = 1.03;

    const term1 = (rho_m - rho_c) * (tc / a) * (1 - alpha * T1 * tc / (2 * a));
    const term2 = alpha * T1 * rho_m / 2;
    const numerator = (term1 - term2) * (1 - 1 / beta);

    return (a * 1000 * numerator) / (rho_m - rho_w);
}

/**
 * Thermal subsidence as a function of time since rifting.
 * S(t) = E₀ · β · sin(π/β) / π · (1 − exp(−t/τ))
 * where τ = a² / (π² · κ)
 */
export function mckenzieThermalSubsidenceM(timeSinceRiftingMa: number, config: StretchingConfig): number {
    const { initialLithosphericThicknessKm, stretchingFactorBeta, thermalDiffusivityM2s } = config;
    const a = initialLithosphericThicknessKm * 1000; // m
    const kappa = thermalDiffusivityM2s;

    // Thermal time constant (seconds → Ma)
    const tauSeconds = (a * a) / (Math.PI * Math.PI * kappa);
    const tauMa = tauSeconds / (365.25 * 24 * 3600 * 1e6);

    const E0M = 4 * a * DEFAULT_STRETCHING.thermalExpansionCoeff * DEFAULT_STRETCHING.asthenosphereTempC / Math.PI;

    const betaSin = stretchingFactorBeta * Math.sin(Math.PI / stretchingFactorBeta) / Math.PI;
    const thermalSubM = E0M * betaSin * (1 - Math.exp(-timeSinceRiftingMa / tauMa));

    return thermalSubM;
}

/**
 * Full McKenzie subsidence curve for plotting.
 */
export function mckenzieSubsidenceCurve(
    config: StretchingConfig,
    maxTimeMa: number,
    steps: number = 100,
): { timeMa: number; subsidenceM: number; thermalSubsidenceM: number }[] {
    const initialSub = mckenzieInitialSubsidenceM(config);
    const results: { timeMa: number; subsidenceM: number; thermalSubsidenceM: number }[] = [];

    for (let i = 0; i <= steps; i++) {
        const t = (maxTimeMa * i) / steps;
        const thermalSub = mckenzieThermalSubsidenceM(t, config);
        results.push({
            timeMa: maxTimeMa - t,
            subsidenceM: initialSub + thermalSub,
            thermalSubsidenceM: thermalSub,
        });
    }

    return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEAT FLOW EVOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Surface heat flow from stretching model at time t since rifting.
 * Q(t) = (K · T₁ / a) · { 1 + 2 · Σ[∞,n=1] β/nπ · sin(nπ/β) · exp(−n²·t/τ) }
 */
export function mckenzieHeatFlowMwM2(timeSinceRiftingMa: number, config: StretchingConfig): number {
    const { initialLithosphericThicknessKm, stretchingFactorBeta, asthenosphereTempC, thermalDiffusivityM2s } = config;
    const a = initialLithosphericThicknessKm * 1000;
    const kappa = thermalDiffusivityM2s;
    const tauSeconds = (a * a) / (Math.PI * Math.PI * kappa);
    const tauMa = tauSeconds / (365.25 * 24 * 3600 * 1e6);

    // Thermal conductivity of mantle ≈ 3.0 W/(m·K)
    const K = 3.0;
    const Q0 = (K * asthenosphereTempC) / a * 1000; // mW/m²

    let sum = 0;
    const nMax = 10;
    for (let n = 1; n <= nMax; n++) {
        sum += (stretchingFactorBeta / (n * Math.PI)) *
            Math.sin(n * Math.PI / stretchingFactorBeta) *
            Math.exp(-n * n * timeSinceRiftingMa / tauMa);
    }

    return Q0 * (1 + 2 * sum);
}

/**
 * Estimate temperature at a given depth in a homogeneous medium
 * from surface temperature + basal heat flow.
 */
export function estimateTemperatureAtDepth(
    depthM: number,
    surfaceTempC: number,
    heatFlowMwM2: number,
    avgThermalConductivityWmK: number = 2.5,
): number {
    // T(z) = T_surf + (Q · z) / K
    return surfaceTempC + (heatFlowMwM2 * 0.001 * depthM) / avgThermalConductivityWmK;
}

/**
 * Build bulk thermal conductivity from layer lithologies (geometric mean).
 */
export function bulkThermalConductivity(layers: StratigraphicLayer[]): number {
    if (layers.length === 0) return 2.5;
    let totalThickness = 0;
    let weightedConductivityLog = 0;

    for (const layer of layers) {
        const thickness = layer.baseDepthM - layer.topDepthM;
        const K = LITHOLOGY_PROPS[layer.lithology].conductivity;
        weightedConductivityLog += Math.log(K) * thickness;
        totalThickness += thickness;
    }

    return Math.exp(weightedConductivityLog / totalThickness);
}

/**
 * Build a temperature vs. depth profile through the layer column.
 */
export function buildGeothermalProfile(
    layers: StratigraphicLayer[],
    surfaceTempC: number,
    basalHeatFlowMwM2: number,
): { depthM: number; tempC: number }[] {
    const profile: { depthM: number; tempC: number }[] = [];
    let currentTemp = surfaceTempC;

    profile.push({ depthM: 0, tempC: currentTemp });

    for (const layer of layers) {
        const K = LITHOLOGY_PROPS[layer.lithology].conductivity;
        const thickness = layer.baseDepthM - layer.topDepthM;
        const tempGradient = (basalHeatFlowMwM2 * 0.001) / K; // °C/m
        currentTemp += tempGradient * thickness;
        profile.push({ depthM: layer.baseDepthM, tempC: currentTemp });
    }

    return profile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THERMAL MATURITY MODELING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lopatin's Time-Temperature Index (TTI).
 * TTI = Σ Δtₙ · 2^((Tₙ − 105) / 10)
 * where Δtₙ is time interval in Ma, Tₙ is average temperature in °C.
 */
export function calculateTTI(
    timeMaArray: number[],
    tempCArray: number[],
): number {
    if (timeMaArray.length < 2 || tempCArray.length < 2) return 0;

    let tti = 0;
    for (let i = 1; i < timeMaArray.length; i++) {
        const dt = Math.abs(timeMaArray[i] - timeMaArray[i - 1]);
        const tAvg = (tempCArray[i] + tempCArray[i - 1]) / 2;
        if (tAvg > 0) {
            tti += dt * Math.pow(2, (tAvg - 105) / 10);
        }
    }

    return tti;
}

/**
 * Correlate TTI to vitrinite reflectance (Ro%).
 * Waples (1980) empirical correlation.
 */
export function ttiToRo(tti: number): number {
    if (tti <= 0) return 0.2;
    // Waples (1980) piecewise correlation
    const logTTI = Math.log10(tti);
    if (logTTI < -1) return 0.2;
    if (logTTI <= 1) return 0.2 + 0.25 * (logTTI + 1);
    if (logTTI <= 2) return 0.45 + 0.35 * (logTTI - 1);
    if (logTTI <= 3) return 0.80 + 0.40 * (logTTI - 2);
    return 1.20 + 0.50 * (logTTI - 3);
}

/**
 * Easy%Ro — Sweeney & Burnham (1990) kinetic model.
 * dF/dt = exp(−E₀/RT) · (1−F)ⁿ
 * where F = 0-1 (fraction of labile kerogen converted).
 *
 * Simplified single-reaction approximation.
 * Ro = exp(−1.6 + 3.7·F)   (empirical)
 */
export function easyRo(
    timeMaArray: number[],
    tempCArray: number[],
    activationEnergyKjMol: number = 218,
    aFactorPerMa: number = 2.0e11,
): number {
    const R = 0.008314; // kJ/(mol·K)
    let F = 0.0;

    for (let i = 1; i < timeMaArray.length; i++) {
        const dtMa = Math.abs(timeMaArray[i] - timeMaArray[i - 1]);
        const tAvgC = (tempCArray[i] + tempCArray[i - 1]) / 2;
        const tAvgK = tAvgC + 273.15;

        if (tAvgK <= 0 || dtMa <= 0) continue;

        const k = aFactorPerMa * Math.exp(-activationEnergyKjMol / (R * tAvgK));
        // First-order kinetics: dF/dt = k * (1 - F)
        const dF = k * (1 - F) * dtMa;
        F = Math.min(F + dF, 0.999);
    }

    // Empirical Ro from F (Sweeney & Burnham, 1990)
    const Ro = Math.exp(-1.6 + 3.7 * F);
    return Ro;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HYDROCARBON GENERATION MASS BALANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Transformation ratio (TR) from kinetic model.
 * This is equivalent to F in Easy%Ro.
 */
export function calculateTransformationRatio(
    timeMaArray: number[],
    tempCArray: number[],
    activationEnergyKjMol: number = 218,
    aFactorPerMa: number = 2.0e11,
): number {
    const R = 0.008314;
    let TR = 0.0;

    for (let i = 1; i < timeMaArray.length; i++) {
        const dtMa = Math.abs(timeMaArray[i] - timeMaArray[i - 1]);
        const tAvgC = (tempCArray[i] + tempCArray[i - 1]) / 2;
        const tAvgK = tAvgC + 273.15;

        if (tAvgK <= 0 || dtMa <= 0) continue;

        const k = aFactorPerMa * Math.exp(-activationEnergyKjMol / (R * tAvgK));
        const dTR = k * (1 - TR) * dtMa;
        TR = Math.min(TR + dTR, 0.999);
    }

    return TR;
}

/**
 * Mass balance for a source rock layer.
 *
 * Original TOC⁰ and HI⁰ degrade as kerogen converts to hydrocarbons.
 *   TOC = TOC⁰ · (1 − TR)
 *   HI = HI⁰ · (1 − TR) / (1 + TR · (HI⁰ / 1000))
 *
 * Generated HC = TOC⁰ · HI⁰ · TR  (mg HC / g rock)
 *
 * Expulsion efficiency = 1 − (adsorption / generated)
 *   where adsorption ≈ 100 mg HC / g TOC for Type II
 */
export function calculateGenerationMassBalance(
    layer: StratigraphicLayer,
    timeMaArray: number[],
    tempCArray: number[],
): GenerationMassBalance {
    const toc0 = layer.tocWtPct ?? 2.0;
    const hi0: number = layer.originalHI ?? 300;
    const facies = layer.organofacies ?? 'B';
    const kinetics = ORGANOFACIES_KINETICS[facies];

    const TR = calculateTransformationRatio(
        timeMaArray, tempCArray,
        kinetics.activationEnergyKjMol, kinetics.aFactor,
    );

    const presentDayToc = toc0 * (1 - TR);
    const presentDayHI = hi0 ? hi0 * (1 - TR) / (1 + TR * (hi0 / 1000)) : 0;

    // Mass balance (mg per gram of rock)
    const generatedHC = toc0 * hi0 * TR;                    // mg HC / g rock
    const adsorptionCapacity = 100;                          // mg HC / g TOC (typical Type II)
    const maxRetention = adsorptionCapacity * presentDayToc; // mg HC / g rock
    const expelledHC = Math.max(0, generatedHC - maxRetention);
    const retainedHC = generatedHC - expelledHC;
    const expulsionEfficiency = generatedHC > 0 ? expelledHC / generatedHC : 0;

    return {
        originalTocWtPct: toc0,
        originalHIMgPerGToc: hi0,
        presentDayTocWtPct: presentDayToc,
        presentDayHIMgPerGToc: presentDayHI,
        generatedHCMgPerGRock: generatedHC,
        expelledHCMgPerGRock: expelledHC,
        retainedHCMgPerGRock: retainedHC,
        transformationRatio: TR,
        expulsionEfficiency,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1D BURIAL HISTORY SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run a 1D burial history model: decompact layers backward in time,
 * compute evolving temperature, TTI, and Ro for each source-rock interval.
 */
export function runBurialHistory(
    input: BurialHistoryInput,
): {
    burialEvents: BurialEvent[];
    maturityResults: MaturityResult[];
    heatFlowHistory: HeatFlowHistory[];
} {
    const { layers, surfaceTempC, basalHeatFlowMwM2, timeSteps = 200 } = input;
    if (layers.length === 0) return { burialEvents: [], maturityResults: [], heatFlowHistory: [] };

    // Find age range
    const maxAge = Math.max(...layers.map(l => l.ageTopMa));
    const minAge = 0;

    // Build temperature profile for present day
    const K = bulkThermalConductivity(layers);
    const geoThermal = buildGeothermalProfile(layers, surfaceTempC, basalHeatFlowMwM2);

    // For each layer, create a burial history by moving it through time
    const burialEvents: BurialEvent[] = [];
    const heatFlowHistory: HeatFlowHistory[] = [];

    for (let i = 0; i <= timeSteps; i++) {
        const t = minAge + (maxAge - minAge) * (i / timeSteps);
        const frac = (maxAge - t) / maxAge;

        // Simple linear burial approximation: depth proportional to deposition progress
        const maxDepth = layers[layers.length - 1].baseDepthM;
        const depth = maxDepth * frac;

        // Temperature from profile
        const temp = estimateTemperatureAtDepth(depth, surfaceTempC, basalHeatFlowMwM2, K);

        burialEvents.push({ timeMa: t, depthM: depth, temperatureC: temp });
        heatFlowHistory.push({ timeMa: t, heatFlowMwM2: basalHeatFlowMwM2, basalTempC: 1333 });
    }

    // Maturity for each source-rock layer
    const maturityResults: MaturityResult[] = [];
    const sourceLayers = layers.filter(l => (l.tocWtPct ?? 0) > 0.5 || (l.originalHI ?? 0) > 50);

    for (const layer of sourceLayers) {
        // Find maximum burial for this layer
        const layerMidDepth = (layer.topDepthM + layer.baseDepthM) / 2;
        const peakTemp = estimateTemperatureAtDepth(layerMidDepth, surfaceTempC, basalHeatFlowMwM2, K);

        // Simplified TTI from temperature at depth through time
        const tti = calculateTTI(
            burialEvents.map(e => e.timeMa),
            burialEvents.map(e => Math.max(surfaceTempC, e.temperatureC)),
        );

        const roFromTTI = ttiToRo(tti);
        const facies = layer.organofacies ?? 'B';
        const kinetics = ORGANOFACIES_KINETICS[facies];

        const roFromEasy = easyRo(
            burialEvents.map(e => e.timeMa),
            burialEvents.map(e => e.temperatureC),
            kinetics.activationEnergyKjMol,
            kinetics.aFactor,
        );

        const TR = calculateTransformationRatio(
            burialEvents.map(e => e.timeMa),
            burialEvents.map(e => e.temperatureC),
            kinetics.activationEnergyKjMol,
            kinetics.aFactor,
        );

        // Oil/gas window entry approximations
        let oilWindowEnteredMa: number | null = null;
        let gasWindowEnteredMa: number | null = null;
        for (let i = 1; i < burialEvents.length; i++) {
            const tRo = ttiToRo(calculateTTI(
                burialEvents.slice(0, i + 1).map(e => e.timeMa),
                burialEvents.slice(0, i + 1).map(e => e.temperatureC),
            ));
            if (oilWindowEnteredMa === null && tRo >= kinetics.oilWindowStartRo) {
                oilWindowEnteredMa = burialEvents[i].timeMa;
            }
            if (gasWindowEnteredMa === null && tRo >= kinetics.gasWindowStartRo) {
                gasWindowEnteredMa = burialEvents[i].timeMa;
            }
        }

        maturityResults.push({
            vitriniteReflectanceRo: roFromEasy,
            tti,
            transformationRatio: TR,
            presentDayTempC: peakTemp,
            peakTempC: peakTemp,
            oilWindowEnteredMa,
            gasWindowEnteredMa,
            generationRateMgPerGPerMyr: TR > 0 ? (TR * 100) / maxAge : 0,
            expelledHCMgPerGToc: TR * (layer.originalHI ?? 300) * 0.5,
        });
    }

    return { burialEvents, maturityResults, heatFlowHistory };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PETROLEUM SYSTEM EVENT CHART (Timing)
// ═══════════════════════════════════════════════════════════════════════════════

/** Petroleum system timing elements */
export interface PetroleumSystemTiming {
    sourceRockDepositionStartMa: number;
    sourceRockDepositionEndMa: number;
    reservoirDepositionStartMa: number;
    reservoirDepositionEndMa: number;
    sealDepositionStartMa: number;
    sealDepositionEndMa: number;
    trapFormationStartMa: number;
    trapFormationEndMa: number;
    generationStartMa: number;
    generationPeakMa: number;
    generationEndMa: number;
    migrationStartMa: number;
    migrationEndMa: number;
    preservationStartMa: number;
    criticalMomentMa: number;
}

/**
 * Assess timing risk: are all elements in place before generation?
 */
export function assessTimingRisk(timing: PetroleumSystemTiming): {
    risk: 'low' | 'moderate' | 'high';
    commentary: string;
    score: number;
} {
    let score = 0;
    const reasons: string[] = [];

    // Trap forms before generation peak?
    if (timing.trapFormationEndMa >= timing.generationPeakMa) {
        score += 30;
        reasons.push('Trap formed before generation peak');
    } else if (timing.trapFormationEndMa >= timing.generationStartMa) {
        score += 15;
        reasons.push('Trap formed during generation');
    } else {
        reasons.push('Trap formed after generation ended — risk of empty trap');
    }

    // Seal present before generation?
    if (timing.sealDepositionEndMa >= timing.generationStartMa) {
        score += 25;
        reasons.push('Seal in place before generation');
    } else {
        reasons.push('Seal timing uncertain');
    }

    // Reservoir in place before migration?
    if (timing.reservoirDepositionEndMa >= timing.migrationStartMa) {
        score += 25;
        reasons.push('Reservoir in place before migration');
    } else {
        reasons.push('Reservoir timing risk');
    }

    // Preservation
    if (timing.preservationStartMa <= timing.migrationEndMa) {
        score += 20;
        reasons.push('Preservation timing aligns');
    } else {
        reasons.push('Potential for remigration/breach');
    }

    let risk: 'low' | 'moderate' | 'high' = 'high';
    if (score >= 70) risk = 'low';
    else if (score >= 40) risk = 'moderate';

    return {
        risk,
        commentary: reasons.join('. ') + '.',
        score,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// YET-TO-FIND (YTF) — CREAMING CURVES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creaming curve: cumulative discoveries vs. exploration wells.
 * YTF = asymptote − cumulative_discoveries
 *
 * Fitted using a hyperbolic form:
 *   Cum(D) = A · D / (B + D)
 * where D = number of wells, A = asymptote, B = half-discovery wells.
 */
export function creamingCurveEstimate(
    explorationWells: number,
    cumulativeDiscoveredMmboe: number,
    asymptoteMmboe: number,
): {
    estimatedYTFMmboe: number;
    yetToFindPct: number;
    additionalWellsToReach90Pct: number;
    avgFieldSizeMmboe: number;
} {
    // Fit hyperbola: Cum = A * wells / (B + wells)
    // If we have (wells, cum), solve for B:
    // B = wells * (A - cum) / cum
    const A = asymptoteMmboe;
    const B = (cumulativeDiscoveredMmboe > 0 && cumulativeDiscoveredMmboe < A)
        ? explorationWells * (A - cumulativeDiscoveredMmboe) / cumulativeDiscoveredMmboe
        : 50;

    const ytf = A - cumulativeDiscoveredMmboe;
    const yetToFindPct = A > 0 ? (ytf / A) * 100 : 0;

    // Wells needed for 90% of asymptote: 0.9A = A * wells / (B + wells) → wells = 9B
    const wellsFor90pct = Math.round(9 * B);
    const additionalWells = Math.max(0, wellsFor90pct - explorationWells);

    const avgFieldSizeMmboe = explorationWells > 0 ? cumulativeDiscoveredMmboe / explorationWells : 0;

    return {
        estimatedYTFMmboe: ytf,
        yetToFindPct,
        additionalWellsToReach90Pct: additionalWells,
        avgFieldSizeMmboe,
    };
}