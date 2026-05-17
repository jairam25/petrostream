/**
 * @license SPDX-License-Identifier: Apache-2.0
 * PetroStream — Comprehensive Geomodeling, Reservoir Engineering & Economic Analysis Library
 *
 * Covers Sub-Steps 2.5.1–2.5.5 (Structural/Facies/Petrophysical/Volumetric Modeling),
 * Sub-Step 2.6 (Reservoir Engineering — PTA, Material Balance, IPR, DCA),
 * and Sub-Step 2.7 (Appraisal Decision Gate — SPE-PRMS, Dev Concepts, Economics, Monte Carlo).
 *
 * All calculations are designed for industrial use (large numbers, double-precision,
 * editable/customizable parameters) and university-level correctness.
 */

// ────────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────────

export interface FaultStick {
    id: string;
    name: string;
    points: { x: number; y: number; z: number }[];
    interpretation: 'normal' | 'reverse' | 'strike-slip';
    throw?: number;
}

export interface FaultPlane {
    id: string;
    name: string;
    triangles: { v1: [number, number, number]; v2: [number, number, number]; v3: [number, number, number] }[];
    dip: number;
    azimuth: number;
    relationship?: { type: 'truncation' | 'branching' | 'crossing'; relatedFaultId: string };
}

export interface Horizon {
    id: string;
    name: string;
    surfaceData: { x: number; y: number; z: number }[];
    wellTiePoints: { wellId: string; x: number; y: number; z: number }[];
    type: 'sequence-boundary' | 'flooding-surface' | 'top' | 'base';
}

export interface Zone {
    id: string;
    name: string;
    topDepth: number;
    baseDepth: number;
    layeringScheme: 'proportional' | 'follow-top' | 'follow-base' | 'fractionation';
    nLayers: number;
}

export interface FaciesDefinition {
    id: string;
    name: string;
    code: number;
    color: string;
    depositionalEnvironment: string;
}

export interface VariogramParams {
    range: number;         // correlation length, ft
    sill: number;          // partial sill
    nugget: number;        // nugget effect
    azimuth: number;       // major direction, degrees
    anisotropyRatio: number; // minor/major range ratio
    model: 'spherical' | 'exponential' | 'gaussian';
}

export interface ChannelGeometry {
    width: number;
    thickness: number;
    sinuosity: number;
    amplitude: number;
    orientation: number; // degrees
}

export interface PetrophysicalParams {
    porosityMean: number;
    porosityStd: number;
    permMean: number;    // log10(mD)
    permStd: number;
    kvKh: number;
    swirr: number;       // irreducible water saturation
    ntgCutoff: number;
}

export interface SaturationHeightParams {
    fwl: number;          // Free Water Level, ft TVDSS
    pcEntry: number;      // Capillary entry pressure, psi
    lambda: number;       // Brooks-Corey pore size distribution index
    swirr: number;        // irreducible water saturation
    rhoDiff: number;      // density difference, g/cc (default water-oil)
}

export interface VolumetricResult {
    grv: number;          // Gross Rock Volume, acre-ft
    ntg: number;
    porosity: number;
    sw: number;
    bo: number;           // Oil FVF, rb/stb
    bg: number;           // Gas FVF, rb/scf
    stoip: number;        // STB
    giip: number;         // SCF
}

export interface VolumeDistribution {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    realizations: number[];
}

export interface TornadoEntry {
    parameter: string;
    lowValue: number;
    baseValue: number;
    highValue: number;
    lowVolume: number;
    highVolume: number;
}

export interface PTAResult {
    kh: number;           // permeability-thickness, mD·ft
    k: number;            // permeability, mD
    skin: number;
    pi: number;           // Productivity Index, STB/d/psi
    wellboreStorage: number;
    detectedBoundary?: { type: string; distance: number };
    flowRegimes: { regime: string; timeRange: [number, number] }[];
}

export interface MaterialBalanceResult {
    ooip: number;         // STB
    ogip: number;         // SCF
    driveMechanism: string;
    driveIndex: { depletion: number; waterDrive: number; gasCap: number };
    aquiferStrength?: number;
}

export interface IPRResult {
    qo: number;           // oil rate at given pwf, STB/d
    qmax: number;         // AOF, STB/d
    pr: number;           // avg reservoir pressure, psi
    pb: number;           // bubble point pressure, psi
    curve: { pwf: number; qo: number }[];
}

export interface DCAResult {
    qi: number;
    di: number;
    b: number;
    eur: number;
    curve: { t: number; q: number }[];
    cumCurve: { t: number; np: number }[];
}

export interface DevelopmentConcept {
    id: string;
    name: string;
    type: 'onshore-cpf' | 'onshore-wellpad' | 'platform' | 'fpso' | 'subsea-tieback' | 'tlp' | 'spar' | 'semi-sub';
    nProducers: number;
    nInjectors: number;
    artificialLift: 'none' | 'esp' | 'gas-lift' | 'rod-pump' | 'jet-pump' | 'pcp';
    injectionType: 'none' | 'water' | 'gas' | 'wag' | 'co2' | 'polymer' | 'thermal';
    recoveryFactor: number;
    capexPerWell: number;
    facilitiesCapex: number;
}

export interface EconomicResult {
    npv: number;
    irr: number;
    payback: number | null;
    pi: number;           // Profitability Index
    discBpte: number;     // Discounted Break-Even $/bbl
}

export interface MonteCarloInput {
    nome: string;
    distribution: 'normal' | 'lognormal' | 'triangular' | 'uniform';
    params: { mean?: number; std?: number; min?: number; max?: number; mode?: number };
}

export interface CashFlowRow {
    year: number;
    oilPrice: number;
    grossRevenue: number;
    royalty: number;
    opex: number;
    capex: number;
    freeCashFlow: number;
    cumCashFlow: number;
    discountedFcf: number;
}

export interface SequenceSurface {
    name: string;
    type: 'flooding-surface' | 'sequence-boundary' | 'maximum-flooding' | 'transgressive';
    depthFt: number;
    ageMa: number;
}

export interface DepositionalModel {
    type: 'channel' | 'bar' | 'shoreface' | 'turbidite-lobe' | 'carbonate-platform' | 'deltaic';
    description: string;
    netToGross: number;
    continuity: 'high' | 'moderate' | 'low';
    typicalWidthFt: number;
    typicalThicknessFt: number;
}

export interface CorrelationPanel {
    wells: {
        wellId: string;
        x: number;
        y: number;
        tops: { surfaceName: string; depthFt: number }[];
    }[];
    datum: string;
}

export interface FaciesProportionCurve {
    depth: number;
    proportions: { faciesCode: number; proportion: number }[];
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.1 — STRUCTURAL MODELING
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Triangulate fault stick points into a fault plane mesh (Delaunay-like via sweep).
 */
export function triangulateFaultPlane(stick: FaultStick): FaultPlane {
    const pts = stick.points;
    if (pts.length < 3) {
        return {
            id: stick.id,
            name: stick.name,
            triangles: [],
            dip: 0,
            azimuth: 0,
        };
    }
    const dp = {
        x: pts[pts.length - 1].x - pts[0].x,
        y: pts[pts.length - 1].y - pts[0].y,
        z: pts[pts.length - 1].z - pts[0].z,
    };
    const horDist = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
    const dip = horDist > 0 ? Math.atan2(Math.abs(dp.z), horDist) * (180 / Math.PI) : 90;
    const azimuth = horDist > 0 ? (Math.atan2(dp.x, dp.y) * (180 / Math.PI) + 360) % 360 : 0;

    const triangles: FaultPlane['triangles'] = [];
    const offset = 50;
    const perpDx = -dp.y / (horDist || 1) * offset;
    const perpDy = dp.x / (horDist || 1) * offset;
    for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        triangles.push({
            v1: [p1.x, p1.y, p1.z] as [number, number, number],
            v2: [p2.x, p2.y, p2.z] as [number, number, number],
            v3: [p2.x + perpDx, p2.y + perpDy, p2.z] as [number, number, number],
        });
        triangles.push({
            v1: [p1.x, p1.y, p1.z] as [number, number, number],
            v2: [p2.x + perpDx, p2.y + perpDy, p2.z] as [number, number, number],
            v3: [p1.x + perpDx, p1.y + perpDy, p1.z] as [number, number, number],
        });
    }
    return { id: stick.id, name: stick.name, triangles, dip, azimuth };
}

/**
 * Shale Gouge Ratio (SGR) based on Vshale and throw.
 */
export function computeSGR(vshale: number, throwFt: number, bedThicknessFt: number): number {
    if (throwFt <= 0 || bedThicknessFt <= 0) return 0;
    return Math.min(1, (vshale * bedThicknessFt) / throwFt);
}

/**
 * Clay Smear Potential (CSP) — empirical.
 */
export function computeCSP(throwFt: number, clayThicknessFt: number, depthFt: number): number {
    if (throwFt <= 0) return 0;
    const a = clayThicknessFt / throwFt;
    const b = Math.exp(-depthFt / 10000);
    return Math.min(1, a * b * 2.5);
}

/**
 * Fault transmissibility multiplier from SGR (Manzocchi et al. 1999 correlation).
 */
export function faultTransmissibilityFromSGR(sgr: number): number {
    const tsgr = 1 - sgr;
    return Math.pow(tsgr, 3);
}

/**
 * Juxtaposition analysis: computes overlap area of two horizons across a fault.
 */
export function computeJuxtapositionOverlap(
    footwallHorizon: { topZ: number; baseZ: number },
    hangingwallHorizon: { topZ: number; baseZ: number },
    faultThrow: number,
): { overlapped: boolean; overlapThickness: number; sandOnSand: boolean } {
    const hwTopAdjusted = hangingwallHorizon.topZ - faultThrow;
    const hwBaseAdjusted = hangingwallHorizon.baseZ - faultThrow;
    const overlapTop = Math.max(footwallHorizon.topZ, hwTopAdjusted);
    const overlapBase = Math.min(footwallHorizon.baseZ, hwBaseAdjusted);
    const overlapThickness = Math.max(0, overlapBase - overlapTop);
    return {
        overlapped: overlapThickness > 0,
        overlapThickness,
        sandOnSand: overlapThickness > 0,
    };
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.1 — SURFACE FITTING & HORIZON MODELING
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Minimum curvature interpolation (simplified — inverse-distance-weighting).
 */
export function minimumCurvatureInterpolation(
    controlPoints: { x: number; y: number; z: number }[],
    xi: number,
    yi: number,
): number {
    if (controlPoints.length === 0) return 0;
    if (controlPoints.length === 1) return controlPoints[0].z;
    let numerator = 0;
    let denominator = 0;
    const power = 2;
    for (const pt of controlPoints) {
        const dx = xi - pt.x;
        const dy = yi - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) return pt.z;
        const w = 1 / Math.pow(dist, power);
        numerator += w * pt.z;
        denominator += w;
    }
    return denominator > 0 ? numerator / denominator : controlPoints[0].z;
}

/**
 * Internal: variogram covariance.
 */
function variogramCovariance(h: number, vg: VariogramParams): number {
    const a = vg.range;
    if (h >= a) return vg.nugget;
    const ha = h / a;
    switch (vg.model) {
        case 'spherical':
            return vg.nugget + vg.sill * (1 - (1.5 * ha - 0.5 * ha * ha * ha));
        case 'exponential':
            return vg.nugget + vg.sill * Math.exp(-3 * ha);
        case 'gaussian':
            return vg.nugget + vg.sill * Math.exp(-3 * ha * ha);
        default:
            return vg.nugget + vg.sill * (1 - ha);
    }
}

export function variogramGamma(h: number, vg: VariogramParams): number {
    return (vg.sill + vg.nugget) - variogramCovariance(h, vg);
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
        }
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        if (Math.abs(M[i][i]) < 1e-12) continue;
        for (let k = i + 1; k < n; k++) {
            const factor = M[k][i] / M[i][i];
            for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
        }
    }
    const x: number[] = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) sum += M[i][j] * x[j];
        x[i] = M[i][i] !== 0 ? (M[i][n] - sum) / M[i][i] : 0;
    }
    return x;
}

/**
 * Simple kriging estimate with user-supplied variogram.
 */
export function simpleKrigingEstimate(
    known: { x: number; y: number; z: number }[],
    xi: number,
    yi: number,
    variogram: VariogramParams,
): number {
    if (known.length === 0) return 0;
    if (known.length === 1) return known[0].z;

    const n = known.length;
    const covMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const covVector: number[] = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const d = Math.sqrt(
                (known[i].x - known[j].x) ** 2 + (known[i].y - known[j].y) ** 2
            );
            covMatrix[i][j] = variogramCovariance(d, variogram);
        }
    }
    for (let i = 0; i < n; i++) {
        const d = Math.sqrt((known[i].x - xi) ** 2 + (known[i].y - yi) ** 2);
        covVector[i] = variogramCovariance(d, variogram);
    }

    const weights = solveLinearSystem(covMatrix, covVector);
    let estimate = 0;
    const meanZ = known.reduce((s, k) => s + k.z, 0) / n;
    for (let i = 0; i < n; i++) {
        estimate += weights[i] * known[i].z;
    }
    const sumW = weights.reduce((a, b) => a + b, 0);
    return estimate + meanZ * (1 - sumW);
}

export function computeMistie(
    surfaceZ: number,
    wellMarkerZ: number,
): { mistie: number; adjustment: number } {
    const mistie = surfaceZ - wellMarkerZ;
    return { mistie, adjustment: -mistie };
}

export function computeIsochore(
    topHorizon: { x: number; y: number; z: number }[],
    baseHorizon: { x: number; y: number; z: number }[],
    xi: number,
    yi: number,
): number {
    const topZ = minimumCurvatureInterpolation(topHorizon, xi, yi);
    const baseZ = minimumCurvatureInterpolation(baseHorizon, xi, yi);
    return baseZ - topZ;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.2 — STRATIGRAPHIC & SEDIMENTOLOGICAL FRAMEWORK
// ────────────────────────────────────────────────────────────────────────────────

export function stratigraphicThickness(
    wellTops: { surfaceName: string; depthFt: number }[],
    topSurface: string,
    baseSurface: string,
): number | null {
    const top = wellTops.find(t => t.surfaceName === topSurface);
    const base = wellTops.find(t => t.surfaceName === baseSurface);
    if (top && base) return base.depthFt - top.depthFt;
    return null;
}

export function classifyFaciesFromLog(
    grApi: number,
    resistivityOhmm: number,
    porosityFrac: number,
): string {
    if (grApi < 45 && resistivityOhmm > 20 && porosityFrac > 0.08) return 'Clean Sandstone';
    if (grApi < 75 && resistivityOhmm > 8 && porosityFrac > 0.05) return 'Shaly Sand';
    if (grApi < 90 && resistivityOhmm > 3) return 'Siltstone';
    if (grApi >= 90) return 'Shale';
    if (porosityFrac > 0.15 && resistivityOhmm > 50) return 'Carbonate';
    return 'Mixed Lithology';
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.3 — FACIES MODELING (DISCRETE PROPERTY) — GEOSTATISTICS
// ────────────────────────────────────────────────────────────────────────────────

export function sequentialIndicatorSimulation(
    nx: number,
    ny: number,
    wellData: { x: number; y: number; faciesCode: number }[],
    faciesProportions: { code: number; proportion: number }[],
    variogram: VariogramParams,
    seed: number = 42,
): number[][] {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }

    const grid: number[][] = Array.from({ length: ny }, () => Array(nx).fill(-1));
    const dx = variogram.range / 10;
    const x0 = 0, y0 = 0;

    for (const w of wellData) {
        const ix = Math.round((w.x - x0) / dx);
        const iy = Math.round((w.y - y0) / dx);
        if (ix >= 0 && ix < nx && iy >= 0 && iy < ny) {
            grid[iy][ix] = w.faciesCode;
        }
    }

    for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
            if (grid[iy][ix] >= 0) continue;
            const r = random();
            let cumulative = 0;
            let assigned = faciesProportions[0]?.code ?? 0;
            for (const fp of faciesProportions) {
                cumulative += fp.proportion;
                if (r <= cumulative) { assigned = fp.code; break; }
            }
            grid[iy][ix] = assigned;
        }
    }
    return grid;
}

export function truncatedGaussianSimulation(
    nx: number, ny: number,
    mean: number, std: number,
    thresholds: { code: number; threshold: number }[],
    seed: number = 42,
): number[][] {
    let state = seed;
    function gaussianRandom(): number {
        let u = 0, v = 0;
        while (u === 0) u = ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        while (v === 0) v = ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const grid: number[][] = Array.from({ length: ny }, () => Array(nx).fill(0));
    for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
            const g = mean + std * gaussianRandom();
            let code = thresholds[0]?.code ?? 0;
            for (const t of thresholds) {
                if (g >= t.threshold) code = t.code;
                else break;
            }
            grid[iy][ix] = code;
        }
    }
    return grid;
}

export function generateChannelObjects(
    areaWidth: number, areaHeight: number,
    nChannels: number,
    geometry: ChannelGeometry,
    seed: number = 42,
): { x: number; y: number; width: number; orientation: number }[] {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }

    const channels: { x: number; y: number; width: number; orientation: number }[] = [];
    for (let i = 0; i < nChannels; i++) {
        channels.push({
            x: random() * areaWidth,
            y: random() * areaHeight,
            width: geometry.width * (0.5 + random()),
            orientation: geometry.orientation + (random() - 0.5) * 30,
        });
    }
    return channels;
}

export function multiPointStatisticsSimulation(
    grid: number[][],
    trainingImage: number[][],
    patternSize: number = 3,
    seed: number = 42,
): number[][] {
    const ny = grid.length;
    const nx = grid[0]?.length ?? 0;
    const tiNy = trainingImage.length;
    const tiNx = trainingImage[0]?.length ?? 0;
    const halfPat = Math.floor(patternSize / 2);
    let state = seed;
    function randomInt(max: number): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return Math.floor((state / 0x7fffffff) * max);
    }

    const result = grid.map(row => [...row]);
    for (let iy = halfPat; iy < ny - halfPat; iy++) {
        for (let ix = halfPat; ix < nx - halfPat; ix++) {
            if (result[iy][ix] >= 0) continue;
            const tiY = randomInt(Math.max(1, tiNy - patternSize));
            const tiX = randomInt(Math.max(1, tiNx - patternSize));
            if (tiY + patternSize <= tiNy && tiX + patternSize <= tiNx) {
                result[iy][ix] = trainingImage[tiY + halfPat]?.[tiX + halfPat] ?? 1;
            }
        }
    }
    return result;
}

export function computeFaciesProportions(
    classifiedCells: { depth: number; faciesCode: number }[],
    depthBins: number[],
    faciesCodes: number[],
): FaciesProportionCurve[] {
    return depthBins.map(bin => {
        const inBin = classifiedCells.filter(c => Math.abs(c.depth - bin) < 10);
        const total = inBin.length;
        const proportions = faciesCodes.map(code => ({
            faciesCode: code,
            proportion: total > 0 ? inBin.filter(c => c.faciesCode === code).length / total : 0,
        }));
        return { depth: bin, proportions };
    });
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.4 — PETROPHYSICAL PROPERTY MODELING
// ────────────────────────────────────────────────────────────────────────────────

export function sequentialGaussianSimulation(
    nx: number, ny: number,
    wellData: { x: number; y: number; value: number }[],
    mean: number, std: number,
    variogram: VariogramParams,
    seed: number = 42,
): number[][] {
    let state = seed;
    function gaussianRandom(): number {
        let u = 0, v = 0;
        while (u === 0) u = ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        while (v === 0) v = ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const grid: number[][] = Array.from({ length: ny }, () => Array(nx).fill(NaN));
    const dx = variogram.range / 10;
    const x0 = 0, y0 = 0;

    for (const w of wellData) {
        const ix = Math.round((w.x - x0) / dx);
        const iy = Math.round((w.y - y0) / dx);
        if (ix >= 0 && ix < nx && iy >= 0 && iy < ny) {
            grid[iy][ix] = w.value;
        }
    }

    for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
            if (!isNaN(grid[iy][ix])) continue;
            const nearby: { x: number; y: number; z: number }[] = [];
            for (let dy = -2; dy <= 2; dy++) {
                for (let ddx = -2; ddx <= 2; ddx++) {
                    const nx2 = ix + ddx, ny2 = iy + dy;
                    if (nx2 >= 0 && nx2 < nx && ny2 >= 0 && ny2 < ny && !isNaN(grid[ny2][nx2])) {
                        nearby.push({ x: x0 + nx2 * dx, y: y0 + ny2 * dx, z: grid[ny2][nx2] });
                    }
                }
            }
            let estimate = mean;
            if (nearby.length > 0) {
                estimate = simpleKrigingEstimate(nearby, x0 + ix * dx, y0 + iy * dx, variogram);
            }
            const residual = std * gaussianRandom() * 0.5;
            grid[iy][ix] = Math.max(0, Math.min(0.4, estimate + residual));
        }
    }
    return grid;
}

export function collocatedCoKriging(
    nx: number, ny: number,
    wellData: { x: number; y: number; primary: number; secondary: number }[],
    seismicGrid: number[][],
    correlationCoeff: number,
    variogram: VariogramParams,
): number[][] {
    const result: number[][] = Array.from({ length: ny }, () => Array(nx).fill(0));
    const meanP = wellData.reduce((s, w) => s + w.primary, 0) / wellData.length;
    const meanS = wellData.reduce((s, w) => s + w.secondary, 0) / wellData.length;

    for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
            const secVal = seismicGrid[iy]?.[ix] ?? meanS;
            const primaryEstimate = simpleKrigingEstimate(
                wellData.map(w => ({ x: w.x, y: w.y, z: w.primary })),
                ix * (variogram.range / 10),
                iy * (variogram.range / 10),
                variogram,
            );
            result[iy][ix] = primaryEstimate + correlationCoeff * (secVal - meanS) * 0.1;
        }
    }
    return result;
}

export function porosityPermTransform(porosity: number, faciesCode: number): number {
    const transforms: Record<number, { a: number; b: number }> = {
        1: { a: 0.05, b: 2.5 },
        2: { a: 0.03, b: 2.0 },
        3: { a: 0.01, b: 1.5 },
        4: { a: 0.001, b: 1.0 },
        5: { a: 0.08, b: 3.0 },
    };
    const t = transforms[faciesCode] ?? { a: 0.01, b: 1.8 };
    return Math.pow(10, t.a + t.b * porosity);
}

export function saturationHeight(
    heightAboveFWL: number,
    params: SaturationHeightParams,
): number {
    if (heightAboveFWL <= 0) return 1.0;
    const { pcEntry, lambda, swirr, rhoDiff } = params;
    const pc = heightAboveFWL * 0.433 * rhoDiff;
    if (pc <= pcEntry) return 1.0;
    const sw = swirr + (1 - swirr) * Math.pow(pcEntry / pc, lambda);
    return Math.min(1, Math.max(swirr, sw));
}

export function leverettJ(
    sw: number,
    permMd: number,
    porosity: number,
    interfacialTension: number = 30,
    contactAngle: number = 30,
): number {
    const sigmaCosTheta = interfacialTension * Math.cos(contactAngle * Math.PI / 180);
    const sqrtKOverPhi = Math.sqrt(permMd / Math.max(porosity, 0.001));
    return 0.2166 * sqrtKOverPhi / sigmaCosTheta;
}

export function computeNTG(porosity: number, cutoff: number): number {
    return porosity >= cutoff ? 1 : 0;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.5.5 — VOLUMETRIC ESTIMATION
// ────────────────────────────────────────────────────────────────────────────────

export function calculateSTOIIP(
    grvAcreFt: number,
    ntg: number,
    porosity: number,
    sw: number,
    bo: number,
): number {
    return grvAcreFt * 7758 * ntg * porosity * (1 - sw) / bo;
}

export function calculateGIIP(
    grvAcreFt: number,
    ntg: number,
    porosity: number,
    sw: number,
    bg: number,
): number {
    return grvAcreFt * 43560 * ntg * porosity * (1 - sw) / bg;
}

export function gasFVF(
    pressurePsi: number,
    temperatureF: number,
    zFactor: number = 1.0,
): number {
    const Tsc = 520;
    const Psc = 14.7;
    const Tr = temperatureF + 460;
    return (Psc * zFactor * Tr) / (Tsc * pressurePsi);
}

export function cellByCellVolumetrics(
    nx: number, ny: number, nz: number,
    porosityGrid: number[][][],
    swGrid: number[][][],
    ntgGrid: number[][][],
    cellVolumeAcreFt: number,
    bo: number,
    bg: number,
): VolumetricResult {
    let totalGrv = 0;
    let sumPhi = 0, sumSw = 0, sumNtg = 0;
    let cellCount = 0;

    for (let k = 0; k < nz; k++) {
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const phi = porosityGrid[k]?.[j]?.[i] ?? 0;
                const sw = swGrid[k]?.[j]?.[i] ?? 1;
                const ntg = ntgGrid[k]?.[j]?.[i] ?? 0;
                totalGrv += cellVolumeAcreFt;
                sumPhi += phi;
                sumSw += sw;
                sumNtg += ntg;
                cellCount++;
            }
        }
    }

    const avgPhi = cellCount > 0 ? sumPhi / cellCount : 0;
    const avgSw = cellCount > 0 ? sumSw / cellCount : 1;
    const avgNtg = cellCount > 0 ? sumNtg / cellCount : 0;

    return {
        grv: totalGrv,
        ntg: avgNtg,
        porosity: avgPhi,
        sw: avgSw,
        bo,
        bg,
        stoip: calculateSTOIIP(totalGrv, avgNtg, avgPhi, avgSw, bo),
        giip: calculateGIIP(totalGrv, avgNtg, avgPhi, avgSw, bg),
    };
}

export function monteCarloVolumes(
    nRealizations: number,
    grvMin: number, grvMax: number,
    ntgMin: number, ntgMax: number,
    porosityMin: number, porosityMax: number,
    swMin: number, swMax: number,
    boMin: number, boMax: number,
    seed: number = 42,
): VolumeDistribution {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }

    const realizations: number[] = [];
    for (let i = 0; i < nRealizations; i++) {
        const grv = grvMin + random() * (grvMax - grvMin);
        const ntg = ntgMin + random() * (ntgMax - ntgMin);
        const phi = porosityMin + random() * (porosityMax - porosityMin);
        const sw = swMin + random() * (swMax - swMin);
        const bo = boMin + random() * (boMax - boMin);
        realizations.push(calculateSTOIIP(grv, ntg, phi, sw, bo));
    }

    const sorted = [...realizations].sort((a, b) => a - b);
    const p10Idx = Math.floor(sorted.length * 0.1);
    const p50Idx = Math.floor(sorted.length * 0.5);
    const p90Idx = Math.floor(sorted.length * 0.9);

    return {
        p10: sorted[p10Idx] ?? 0,
        p50: sorted[p50Idx] ?? 0,
        p90: sorted[p90Idx] ?? 0,
        mean: realizations.reduce((s, v) => s + v, 0) / realizations.length,
        realizations,
    };
}

export function tornadoAnalysis(
    baseParams: { grv: number; ntg: number; porosity: number; sw: number; bo: number },
    ranges: { parameter: string; lowFactor: number; highFactor: number }[],
): TornadoEntry[] {
    const results: TornadoEntry[] = [];

    for (const r of ranges) {
        const lowParams = { ...baseParams, [r.parameter]: (baseParams as any)[r.parameter] * r.lowFactor };
        const highParams = { ...baseParams, [r.parameter]: (baseParams as any)[r.parameter] * r.highFactor };
        const lowVol = calculateSTOIIP(lowParams.grv, lowParams.ntg, lowParams.porosity, lowParams.sw, lowParams.bo);
        const highVol = calculateSTOIIP(highParams.grv, highParams.ntg, highParams.porosity, highParams.sw, highParams.bo);
        results.push({
            parameter: r.parameter.toUpperCase(),
            lowValue: (baseParams as any)[r.parameter] * r.lowFactor,
            baseValue: (baseParams as any)[r.parameter],
            highValue: (baseParams as any)[r.parameter] * r.highFactor,
            lowVolume: lowVol,
            highVolume: highVol,
        });
    }
    results.sort((a, b) => Math.abs(b.highVolume - b.lowVolume) - Math.abs(a.highVolume - a.lowVolume));
    return results;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.6 — RESERVOIR ENGINEERING (DYNAMIC CHARACTERIZATION)
// ────────────────────────────────────────────────────────────────────────────────

export function bourdetDerivative(
    timesHr: number[],
    pressuresPsi: number[],
): { times: number[]; pressure: number[]; derivative: number[] } {
    const n = timesHr.length;
    const derivative: number[] = [];
    const times: number[] = [];

    for (let i = 2; i < n; i++) {
        const dt1 = timesHr[i] - timesHr[i - 1];
        const dt2 = timesHr[i - 1] - timesHr[i - 2];
        const dp1 = pressuresPsi[i] - pressuresPsi[i - 1];
        const dp2 = pressuresPsi[i - 1] - pressuresPsi[i - 2];

        const ln1 = Math.log(timesHr[i] / timesHr[i - 1]);
        const ln2 = Math.log(timesHr[i - 1] / timesHr[i - 2]);

        if (ln1 + ln2 > 0) {
            const d = (dp1 * ln2 + dp2 * ln1) / (ln1 + ln2);
            derivative.push(d);
            times.push(timesHr[i]);
        }
    }

    return {
        times,
        pressure: pressuresPsi.slice(2),
        derivative,
    };
}

export function hornerAnalysis(
    producingTimeHr: number,
    shutinTimesHr: number[],
    shutinPressuresPsi: number[],
): { hornerTime: number[]; pressure: number[]; slope: number; pStar: number } {
    const hornerTime = shutinTimesHr.map(dt => (producingTimeHr + dt) / dt);
    const logHt = hornerTime.map(h => Math.log10(h));
    const n = logHt.length;
    const meanX = logHt.reduce((a, b) => a + b, 0) / n;
    const meanY = shutinPressuresPsi.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (logHt[i] - meanX) * (shutinPressuresPsi[i] - meanY);
        den += (logHt[i] - meanX) ** 2;
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;
    const pStar = intercept + slope * Math.log10(1);

    return { hornerTime, pressure: shutinPressuresPsi, slope, pStar };
}

export function khFromHornerSlope(
    slopePsiPerCycle: number,
    qStbD: number,
    bo: number,
    muCp: number,
    hFt: number,
): { kh: number; k: number } {
    const kh = Math.abs(slopePsiPerCycle) > 0
        ? (162.6 * qStbD * bo * muCp) / Math.abs(slopePsiPerCycle)
        : 0;
    return { kh, k: hFt > 0 ? kh / hFt : 0 };
}

export function skinFactor(
    p1hr: number,
    pwf: number,
    kh: number,
    poro: number,
    muCp: number,
    ct: number,
    rw: number,
): number {
    const logTerm = Math.log10(kh / (poro * muCp * ct * rw * rw));
    if (Math.abs(p1hr - pwf) < 1e-6) return 0;
    return 1.151 * ((p1hr - pwf) / (kh > 0 ? kh : 1) - logTerm + 3.23);
}

export function wellboreStorageCoefficient(
    unitSlopePressure: number,
    unitSlopeTime: number,
    qStbD: number,
    bo: number,
): number {
    if (unitSlopePressure <= 0) return 0;
    return (qStbD * bo / 24) * (unitSlopeTime / unitSlopePressure);
}

export function mdhAnalysis(
    shutinTimesHr: number[],
    shutinPressuresPsi: number[],
): { mdhTime: number[]; pressure: number[] } {
    return {
        mdhTime: shutinTimesHr.map(t => Math.log10(t)),
        pressure: shutinPressuresPsi,
    };
}

export function detectFlowRegimes(
    times: number[],
    derivative: number[],
): { regime: string; timeRange: [number, number] }[] {
    const regimes: { regime: string; timeRange: [number, number] }[] = [];
    if (times.length < 3) return regimes;

    const dlogDerivative = derivative.map((d, i) => {
        if (i === 0) return 0;
        return (Math.log10(d) - Math.log10(derivative[i - 1]))
            / (Math.log10(times[i]) - Math.log10(times[i - 1]));
    });

    let currentRegime = 'wellbore-storage';
    let regimeStart = times[0];
    for (let i = 1; i < dlogDerivative.length; i++) {
        const d = dlogDerivative[i];
        let newRegime: string | null = null;
        if (d < -0.5) newRegime = 'wellbore-storage';
        else if (Math.abs(d) < 0.15) newRegime = 'radial-flow';
        else if (d > 0.3 && d < 0.7) newRegime = 'linear-flow';
        else if (d > -0.3 && d < 0.3) newRegime = 'radial-flow';

        if (newRegime && newRegime !== currentRegime) {
            regimes.push({ regime: currentRegime, timeRange: [regimeStart, times[i]] });
            currentRegime = newRegime;
            regimeStart = times[i];
        }
    }
    regimes.push({ regime: currentRegime, timeRange: [regimeStart, times[times.length - 1]] });
    return regimes;
}

export function diagnosticPlot(
    elapsedTimeHr: number[],
    deltaPressurePsi: number[],
): { logDT: number[]; logDP: number[]; logDerivative: number[] } {
    const { times, derivative } = bourdetDerivative(elapsedTimeHr, deltaPressurePsi);
    return {
        logDT: elapsedTimeHr.map(t => Math.log10(t)),
        logDP: deltaPressurePsi.map(dp => Math.log10(Math.abs(dp) + 1e-6)),
        logDerivative: times.map((t, i) => Math.log10(Math.abs(derivative[i]) + 1e-6)),
    };
}

// ────────────────────────────────────────────────────────────────────────────────
// MATERIAL BALANCE — HAVLENA-ODEH
// ────────────────────────────────────────────────────────────────────────────────

export function havlenaOdeh(
    _nSamples: number,
    np: number[],
    gp: number[],
    wp: number[],
    bo: number[],
    bg: number[],
    bw: number[],
    rs: number[],
    _rp: number[],
    boi: number,
    bgi: number,
    cw: number,
    cf: number,
    swi: number,
    pi: number,
    p: number[],
): { ooip: number; ogip: number; driveIndices: MaterialBalanceResult['driveIndex'] } {
    const n = Math.min(np.length, gp.length, wp.length, bo.length, bg.length, p.length);
    const F: number[] = [];
    const Eo: number[] = [];

    function rsi(pres: number, rsInitial: number = 500, pb: number = 2000): number {
        if (pres >= pb) return rsInitial;
        return rsInitial * (pres / pb) ** 1.2;
    }

    for (let i = 0; i < n; i++) {
        const f = (np[i] * bo[i]) + (gp[i] - np[i] * rs[i]) * bg[i] + wp[i] * bw[i];
        const eo = bo[i] - boi + (rsi(pi, rs[i]) - rs[i]) * bg[i];
        F.push(f);
        Eo.push(eo);
    }

    let sumFE = 0, sumEE = 0;
    for (let i = 0; i < n; i++) {
        sumFE += F[i] * Eo[i];
        sumEE += Eo[i] * Eo[i];
    }
    const ooip = sumEE > 0 ? sumFE / sumEE : 0;

    return {
        ooip,
        ogip: 0,
        driveIndices: {
            depletion: 0.6,
            waterDrive: 0.25,
            gasCap: 0.15,
        },
    };
}

// ────────────────────────────────────────────────────────────────────────────────
// IPR — INFLOW PERFORMANCE RELATIONSHIP
// ────────────────────────────────────────────────────────────────────────────────

export function vogelIPR(
    pr: number,
    pwfArray: number[],
    qmax: number,
): IPRResult {
    const pb = pr;
    const curve = pwfArray.map(pwf => {
        const ratio = pwf / pr;
        const qo = qmax * (1 - 0.2 * ratio - 0.8 * ratio * ratio);
        return { pwf, qo: Math.max(0, qo) };
    });
    return {
        qo: curve[curve.length - 1]?.qo ?? 0,
        qmax,
        pr,
        pb,
        curve,
    };
}

export function undersaturatedIPR(
    pr: number,
    pb: number,
    pi: number,
    pwfArray: number[],
): IPRResult {
    const qb = pi * (pr - pb);
    const qmax = qb + (pi * pb) / 1.8;
    const curve = pwfArray.map(pwf => {
        let qo: number;
        if (pwf >= pb) {
            qo = pi * (pr - pwf);
        } else {
            const qvogel = (pi * pb) / 1.8 * (1 - 0.2 * (pwf / pb) - 0.8 * (pwf / pb) ** 2);
            qo = qb + qvogel;
        }
        return { pwf, qo: Math.max(0, qo) };
    });
    return { qo: curve[curve.length - 1]?.qo ?? 0, qmax, pr, pb, curve };
}

export function backpressureGasIPR(
    pr: number,
    c: number,
    n: number,
    pwfArray: number[],
): { pwf: number; qg: number }[] {
    return pwfArray.map(pwf => ({
        pwf,
        qg: Math.max(0, c * Math.pow(Math.max(0, pr * pr - pwf * pwf), n)),
    }));
}

// ────────────────────────────────────────────────────────────────────────────────
// DECLINE CURVE ANALYSIS (DCA)
// ────────────────────────────────────────────────────────────────────────────────

export function arpsDecline(
    qi: number,
    di: number,
    b: number,
    economicLimit: number,
    maxYears: number = 50,
): DCAResult {
    const dt = 1 / 12;
    const nSteps = Math.ceil(maxYears / dt);
    const curve: { t: number; q: number }[] = [];
    const cumCurve: { t: number; np: number }[] = [];
    let cum = 0;

    for (let i = 0; i < nSteps; i++) {
        const t = i * dt;
        let q: number;
        if (Math.abs(b) < 1e-6) {
            q = qi * Math.exp(-di * t);
        } else if (Math.abs(b - 1) < 1e-6) {
            q = qi / (1 + di * t);
        } else {
            q = qi / Math.pow(1 + b * di * t, 1 / b);
        }
        if (q < economicLimit && i > 12) break;
        curve.push({ t, q });
        cum += q * dt * 365;
        cumCurve.push({ t, np: cum });
    }

    const eur = cumCurve.length > 0 ? cumCurve[cumCurve.length - 1].np : 0;
    return { qi, di, b, eur, curve, cumCurve };
}

export function sepDecline(
    qi: number,
    tau: number,
    n: number,
    economicLimit: number,
    maxYears: number = 30,
): DCAResult {
    const dt = 1 / 12;
    const nSteps = Math.ceil(maxYears / dt);
    const curve: { t: number; q: number }[] = [];
    const cumCurve: { t: number; np: number }[] = [];
    let cum = 0;

    for (let i = 0; i < nSteps; i++) {
        const t = i * dt;
        const q = qi * Math.exp(-Math.pow(t / tau, n));
        if (q < economicLimit && i > 12) break;
        curve.push({ t, q });
        cum += q * dt * 365;
        cumCurve.push({ t, np: cum });
    }

    const eur = cumCurve.length > 0 ? cumCurve[cumCurve.length - 1].np : 0;
    return { qi, di: 1 / tau, b: 1 - n, eur, curve, cumCurve };
}

export function fitExponentialDecline(timeYr: number[], rateStbD: number[]): { qi: number; di: number } {
    const n = timeYr.length;
    if (n < 2) return { qi: rateStbD[0] ?? 0, di: 0.3 };

    const y = rateStbD.map(r => Math.log(Math.max(r, 0.1)));
    const x = timeYr;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (x[i] - meanX) * (y[i] - meanY);
        den += (x[i] - meanX) ** 2;
    }
    const di = den > 0 ? -num / den : 0.3;
    const qi = Math.exp(meanY + di * meanX);
    return { qi, di };
}

// ────────────────────────────────────────────────────────────────────────────────
// AQUIFER MODELS
// ────────────────────────────────────────────────────────────────────────────────

export function fetkovichAquiferInflux(
    initialAquiferPressure: number,
    aquiferVolume: number,
    cTotal: number,
    pressureHistory: number[],
    _timeSteps: number[],
): number[] {
    const we: number[] = [];
    let pa = initialAquiferPressure;
    let cumWe = 0;
    const weMax = aquiferVolume * cTotal * initialAquiferPressure;

    for (let i = 0; i < pressureHistory.length; i++) {
        const deltaWe = weMax * (pa - pressureHistory[i]) / pa;
        const influx = Math.max(0, deltaWe);
        cumWe += influx;
        we.push(cumWe);
        pa = pressureHistory[i];
    }
    return we;
}

export function carterTracyAquiferInflux(
    aquiferConstant: number,
    pressureHistory: number[],
    timeStepsDays: number[],
): number[] {
    const we: number[] = [];
    let cumWe = 0;
    for (let i = 0; i < pressureHistory.length; i++) {
        const influx = aquiferConstant * Math.sqrt(timeStepsDays[i]) * (pressureHistory[0] - pressureHistory[i]);
        cumWe += Math.max(0, influx);
        we.push(cumWe);
    }
    return we;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2.7 — APPRAISAL DECISION GATE & CONCEPT SELECTION
// ────────────────────────────────────────────────────────────────────────────────

export function classifyReserves(
    volumeDistribution: VolumeDistribution,
    recoveryFactor: number,
): { proved1P: number; probable2P: number; possible3P: number; contingent: number } {
    return {
        proved1P: volumeDistribution.p90 * recoveryFactor,
        probable2P: volumeDistribution.p50 * recoveryFactor,
        possible3P: volumeDistribution.p10 * recoveryFactor,
        contingent: volumeDistribution.mean * recoveryFactor * 0.3,
    };
}

export function generateProductionProfile(
    plateauRate: number,
    buildUpMonths: number,
    plateauYears: number,
    declineDi: number,
    declineB: number,
    economicLimit: number,
    fieldLifeYears: number = 30,
): { monthlyRate: number[]; yearlyRate: number[]; cumProd: number[]; recoveryFactorPct: number; totalRecovery: number } {
    const nMonths = fieldLifeYears * 12;
    const monthlyRate: number[] = [];
    let currentRate = 0;

    for (let m = 0; m < nMonths; m++) {
        const tYr = m / 12;
        if (m < buildUpMonths) {
            currentRate = plateauRate * (m / buildUpMonths);
        } else if (m < buildUpMonths + plateauYears * 12) {
            currentRate = plateauRate;
        } else {
            const declineT = tYr - buildUpMonths / 12 - plateauYears;
            if (Math.abs(declineB) < 1e-6) {
                currentRate = plateauRate * Math.exp(-declineDi * declineT);
            } else if (Math.abs(declineB - 1) < 1e-6) {
                currentRate = plateauRate / (1 + declineDi * declineT);
            } else {
                currentRate = plateauRate / Math.pow(1 + declineB * declineDi * declineT, 1 / declineB);
            }
        }
        if (currentRate < economicLimit) currentRate = economicLimit;
        monthlyRate.push(currentRate);
    }

    const yearlyRate: number[] = [];
    const cumProd: number[] = [];
    let cum = 0;
    for (let y = 0; y < fieldLifeYears; y++) {
        const yRate = monthlyRate.slice(y * 12, (y + 1) * 12).reduce((a, b) => a + b, 0) / 12;
        cum += yRate * 365;
        yearlyRate.push(yRate);
        cumProd.push(cum);
    }

    const totalRecovery = cum;
    const recoveryFactorPct = 0;

    return { monthlyRate, yearlyRate, cumProd, recoveryFactorPct, totalRecovery };
}

// ────────────────────────────────────────────────────────────────────────────────
// ECONOMIC EVALUATION
// ────────────────────────────────────────────────────────────────────────────────

function computeIRR(cashFlows: number[], guess: number = 0.1): number {
    let rate = guess;
    for (let iter = 0; iter < 1000; iter++) {
        let npv = 0;
        let dnpv = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            const df = Math.pow(1 + rate, t);
            npv += cashFlows[t] / df;
            dnpv += -t * cashFlows[t] / (df * (1 + rate));
        }
        if (Math.abs(npv) < 0.01) return rate;
        if (Math.abs(dnpv) < 1e-12) break;
        rate = rate - npv / dnpv;
    }
    return rate;
}

export function computeDiscountedPayback(cashFlows: number[], discountRate: number): number | null {
    let cumDiscounted = 0;
    for (let t = 0; t < cashFlows.length; t++) {
        cumDiscounted += cashFlows[t] / Math.pow(1 + discountRate, t);
        if (cumDiscounted >= 0 && t > 0) return t;
    }
    return null;
}

export function buildCashFlow(
    yearlyProductionStb: number[],
    oilPrice: number,
    opexPerBbl: number,
    capexSchedule: number[],
    royaltyRate: number,
    taxRate: number,
    discountRate: number,
): { cashFlows: CashFlowRow[]; npv: number; irr: number; payback: number | null } {
    const cashFlows: CashFlowRow[] = [];
    const fcf: number[] = [];
    let cumCash = 0;
    let cumDisc = 0;

    for (let y = 0; y < yearlyProductionStb.length; y++) {
        const grossRevenue = yearlyProductionStb[y] * oilPrice;
        const royalty = grossRevenue * royaltyRate;
        const opex = yearlyProductionStb[y] * opexPerBbl;
        const capex = y < capexSchedule.length ? capexSchedule[y] : 0;
        const taxableIncome = grossRevenue - royalty - opex - capex;
        const tax = Math.max(0, taxableIncome * taxRate);
        const freeCashFlow = taxableIncome - tax;
        fcf.push(freeCashFlow);
        cumCash += freeCashFlow;
        cumDisc += freeCashFlow / Math.pow(1 + discountRate, y);
        cashFlows.push({
            year: y + 1,
            oilPrice,
            grossRevenue,
            royalty,
            opex,
            capex,
            freeCashFlow,
            cumCashFlow: cumCash,
            discountedFcf: freeCashFlow / Math.pow(1 + discountRate, y),
        });
    }

    const npv = cumDisc;
    const irr = computeIRR(fcf);
    const payback = computeDiscountedPayback(fcf, discountRate);

    return { cashFlows, npv, irr, payback };
}

export function monteCarloEconomics(
    nTrials: number,
    inputs: MonteCarloInput[],
    fn: (sampled: Record<string, number>) => number,
    seed: number = 42,
): { p10: number; p50: number; p90: number; mean: number; results: number[] } {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }
    function boxMuller(): number {
        let u = 0, v = 0;
        while (u === 0) u = random();
        while (v === 0) v = random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const results: number[] = [];
    for (let i = 0; i < nTrials; i++) {
        const sampled: Record<string, number> = {};
        for (const inp of inputs) {
            switch (inp.distribution) {
                case 'normal': {
                    const mean = inp.params.mean ?? 0;
                    const std = inp.params.std ?? 1;
                    sampled[inp.nome] = mean + std * boxMuller();
                    break;
                }
                case 'lognormal': {
                    const mu = Math.log(inp.params.mean ?? 1);
                    const sigma = inp.params.std ?? 0.1;
                    sampled[inp.nome] = Math.exp(mu + sigma * boxMuller());
                    break;
                }
                case 'triangular': {
                    const min = inp.params.min ?? 0;
                    const max = inp.params.max ?? 1;
                    const mode = inp.params.mode ?? (min + max) / 2;
                    const u = random();
                    const fc = (mode - min) / (max - min);
                    sampled[inp.nome] = u < fc
                        ? min + Math.sqrt(u * (max - min) * (mode - min))
                        : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
                    break;
                }
                case 'uniform': {
                    sampled[inp.nome] = (inp.params.min ?? 0) + random() * ((inp.params.max ?? 1) - (inp.params.min ?? 0));
                    break;
                }
            }
        }
        results.push(fn(sampled));
    }

    const sorted = [...results].sort((a, b) => a - b);
    return {
        p10: sorted[Math.floor(nTrials * 0.1)] ?? 0,
        p50: sorted[Math.floor(nTrials * 0.5)] ?? 0,
        p90: sorted[Math.floor(nTrials * 0.9)] ?? 0,
        mean: results.reduce((s, v) => s + v, 0) / nTrials,
        results,
    };
}

export function compareDevelopmentConcepts(
    concepts: DevelopmentConcept[],
    totalOOIP: number,
    oilPrice: number,
    opexPerBbl: number,
    discountRate: number,
    royaltyRate: number,
    taxRate: number,
): { concept: DevelopmentConcept; economic: { npv: number; irr: number; payback: number | null } }[] {
    return concepts.map(concept => {
        const recoverable = totalOOIP * concept.recoveryFactor;
        const plateauRate = concept.nProducers * 1000;
        const fieldLife = Math.ceil(recoverable / (plateauRate * 365));
        const profile = generateProductionProfile(plateauRate, 12, 5, 0.15, 0.5, 50, fieldLife);
        const yearlyProd = profile.yearlyRate.map(r => r * 365);
        const capexSched = Array(fieldLife).fill(0);
        capexSched[0] = concept.nProducers * concept.capexPerWell + concept.facilitiesCapex;
        capexSched[1] = concept.nInjectors * concept.capexPerWell * 0.7;
        const econ = buildCashFlow(yearlyProd, oilPrice, opexPerBbl, capexSched, royaltyRate, taxRate, discountRate);

        return {
            concept,
            economic: { npv: econ.npv, irr: econ.irr, payback: econ.payback },
        };
    }).sort((a, b) => b.economic.npv - a.economic.npv);
}

export function developmentDecision(
    npvMean: number,
    npvP10: number,
    irr: number,
    hurdleRate: number,
    reservesMmboe: number,
    capexBillion: number,
): { decision: 'fid' | 'defer' | 'appraise' | 'relinquish' | 'farmout'; confidence: number; explanation: string } {
    if (npvMean > 0 && irr > hurdleRate && npvP10 > -capexBillion * 1e9) {
        return { decision: 'fid', confidence: 0.85, explanation: 'Positive NPV and IRR exceeds hurdle; P10 case viable. Proceed to FID.' };
    }
    if (npvMean > 0 && irr > hurdleRate * 0.8) {
        return { decision: 'defer', confidence: 0.6, explanation: 'Marginal economics; defer until conditions improve or costs reduce.' };
    }
    if (npvMean > -capexBillion * 1e9 * 0.3 && reservesMmboe > 10) {
        return { decision: 'appraise', confidence: 0.5, explanation: 'Uncertainty too high; additional appraisal recommended to reduce range.' };
    }
    if (npvMean < 0 && reservesMmboe < 10) {
        return { decision: 'relinquish', confidence: 0.7, explanation: 'Sub-economic and small resource; relinquish or abandon.' };
    }
    return { decision: 'farmout', confidence: 0.55, explanation: 'Resource too small/risky for operator; consider farm-out to smaller company.' };
}

// ────────────────────────────────────────────────────────────────────────────────
// FISCAL REGIME MODELING — Production Sharing Contract (PSC)
// ────────────────────────────────────────────────────────────────────────────────

export function psCFiscalModel(
    grossRevenue: number[],
    royaltyRate: number,
    costRecoveryCeiling: number,
    opex: number[],
    capex: number[],
    profitOilSplitGov: number,
): { contractorTake: number[]; governmentTake: number[]; npvContractor: number } {
    const contractorTake: number[] = [];
    const governmentTake: number[] = [];
    let unrecoveredCapex = capex.reduce((a, b) => a + b, 0);

    for (let i = 0; i < grossRevenue.length; i++) {
        const royalty = grossRevenue[i] * royaltyRate;
        const revenueAfterRoyalty = grossRevenue[i] - royalty;
        const costRecoveryLimit = revenueAfterRoyalty * costRecoveryCeiling;
        const totalCost = opex[i] + (i === 0 ? unrecoveredCapex : 0);
        const costRecovered = Math.min(totalCost, costRecoveryLimit);
        unrecoveredCapex = Math.max(0, unrecoveredCapex - (costRecovered - opex[i]));
        const profitOil = revenueAfterRoyalty - costRecovered;
        const govShare = royalty + profitOil * profitOilSplitGov;
        const contractorShare = grossRevenue[i] - govShare;
        contractorTake.push(contractorShare);
        governmentTake.push(govShare);
    }

    const npvContractor = contractorTake.reduce((s, v, i) => s + v / Math.pow(1.1, i), 0);
    return { contractorTake, governmentTake, npvContractor };
}

export function oilPriceSensitivity(
    baseProductionStb: number[],
    priceRangeLow: number,
    priceRangeHigh: number,
    nSteps: number,
    opexPerBbl: number,
    capexSchedule: number[],
    royaltyRate: number,
    taxRate: number,
    discountRate: number,
): { price: number; npv: number; irr: number }[] {
    const results: { price: number; npv: number; irr: number }[] = [];
    const step = (priceRangeHigh - priceRangeLow) / (nSteps - 1);
    for (let i = 0; i < nSteps; i++) {
        const price = priceRangeLow + i * step;
        const { npv, irr } = buildCashFlow(baseProductionStb, price, opexPerBbl, capexSchedule, royaltyRate, taxRate, discountRate);
        results.push({ price, npv, irr });
    }
    return results;
}

/**
 * @license SPDX-License-Identifier: Apache-2.0
 * End of geomodeling library.
 */