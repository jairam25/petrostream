import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Map as MapIcon, Grid3X3, Waves, Layers, Search, Maximize2, Box,
    AreaChart as AreaIcon, BarChart2, GitMerge, Cpu, Activity,
    SlidersHorizontal, Target, Crosshair, Scissors, Shuffle,
    TrendingUp, PieChart, Filter, ArrowUpDown, Database,
    GitBranch, Hexagon, CircleDot, Eye, Zap, Calculator,
    ChevronDown, ChevronUp, Play, RotateCcw, Download, AlertTriangle,
    AlertOctagon, CheckCircle2, Clock, Globe, PenLine, Hash
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import {
    triangulateFaultPlane,
    computeSGR,
    computeCSP,
    faultTransmissibilityFromSGR,
    computeJuxtapositionOverlap,
    minimumCurvatureInterpolation,
    simpleKrigingEstimate,
    variogramGamma,
    computeMistie,
    computeIsochore,
    sequentialIndicatorSimulation,
    truncatedGaussianSimulation,
    generateChannelObjects,
    multiPointStatisticsSimulation,
    computeFaciesProportions,
    sequentialGaussianSimulation,
    collocatedCoKriging,
    porosityPermTransform,
    saturationHeight,
    leverettJ,
    computeNTG,
    calculateSTOIIP,
    calculateGIIP,
    gasFVF,
    cellByCellVolumetrics,
    FaultStick,
    FaultPlane,
    Horizon,
    Zone,
    FaciesDefinition,
    VariogramParams,
    ChannelGeometry,
    PetrophysicalParams,
    SaturationHeightParams,
    VolumetricResult,
    VolumeDistribution,
    TornadoEntry,
} from '../../lib/geomodeling';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell,
    BarChart, Bar, Legend, ComposedChart, AreaChart,
    Area, ReferenceLine, ReferenceArea,
} from 'recharts';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────
const FACIES_DEFS: FaciesDefinition[] = [
    { id: '1', name: 'Channel Sand', code: 1, color: '#f59e0b', depositionalEnvironment: 'Fluvial Channel' },
    { id: '2', name: 'Crevasse Splay', code: 2, color: '#d97706', depositionalEnvironment: 'Fluvial Overbank' },
    { id: '3', name: 'Levee Silt', code: 3, color: '#10b981', depositionalEnvironment: 'Levee' },
    { id: '4', name: 'Floodplain Shale', code: 4, color: '#6b7280', depositionalEnvironment: 'Floodplain' },
    { id: '5', name: 'Carbonate Shoal', code: 5, color: '#3b82f6', depositionalEnvironment: 'Carbonate Platform' },
];

const DEPOSITIONAL_ENVS = [
    { type: 'fluvial-channel' as const, name: 'Fluvial Channel System', ntg: 0.7, continuity: 'moderate' as const, w: 1500, t: 35 },
    { type: 'shoreface' as const, name: 'Shoreface Complex', ntg: 0.55, continuity: 'high' as const, w: 8000, t: 50 },
    { type: 'turbidite-lobe' as const, name: 'Turbidite Lobe', ntg: 0.6, continuity: 'low' as const, w: 3000, t: 25 },
    { type: 'deltaic' as const, name: 'Deltaic System', ntg: 0.4, continuity: 'moderate' as const, w: 5000, t: 80 },
    { type: 'carbonate-platform' as const, name: 'Carbonate Platform', ntg: 0.8, continuity: 'high' as const, w: 20000, t: 150 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Color utilities for grid cells
// ──────────────────────────────────────────────────────────────────────────────
function propColor(value: number, min: number, max: number, scheme: 'por' | 'perm' | 'sw' | 'ntg'): string {
    const t = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0.5;
    switch (scheme) {
        case 'por':
            return `rgb(${Math.round(15 + t * 50)},${Math.round(70 + t * 170)},${Math.round(180 - t * 70)})`;
        case 'perm':
            return `rgb(${Math.round(180 + t * 75)},${Math.round(80 + t * 50)},${Math.round(15 + t * 45)})`;
        case 'sw':
            return `rgb(${Math.round(30 + t * 70)},${Math.round(60 + t * 100)},${Math.round(200 + t * 55)})`;
        case 'ntg':
            return `rgb(${Math.round(50 + t * 160)},${Math.round(90 + t * 130)},${Math.round(30 + t * 40)})`;
        default:
            return `hsl(${Math.round(200 + t * 50)},70%,${Math.round(30 + t * 40)}%)`;
    }
}

function faciesColor(code: number): string {
    return FACIES_DEFS.find(f => f.code === code)?.color ?? '#6b7280';
}

// ──────────────────────────────────────────────────────────────────────────────
// Reusable section header
// ──────────────────────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                <Icon className="text-amber-500" size={24} />
                {title}
            </h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Parameter slider with editable text input
// ──────────────────────────────────────────────────────────────────────────────
function ParamSlider({ label, value, min, max, step, unit, onChange, precision, hint }: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; onChange: (v: number) => void; precision?: number; hint?: string;
}) {
    const p = precision ?? 2;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-mono font-black text-amber-400">{value < 1e9 ? formatNumber(value, p) : value.toExponential(2)} {unit}</span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <input
                type="number"
                value={value}
                onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v))); }}
                step={step}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-white text-right focus:outline-none focus:border-amber-500/50"
            />
            {hint && <p className="text-[10px] text-slate-600 italic">{hint}</p>}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Build seeded random for reproducibility
// ──────────────────────────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export function GeomodelingModule() {
    const [activeTab, setActiveTab] = useState<'structural' | 'stratigraphic' | 'facies' | 'petrophysical' | 'volumetrics'>('structural');
    const [variant, setVariant] = useState<'3d' | 'grid' | 'map'>('3d');

    // ── Fault Parameters ─────────────────────────────────────────────────────
    const [faultSticks, setFaultSticks] = useState<FaultStick[]>([
        {
            id: 'F1', name: 'Main Border Fault',
            points: [
                { x: 0, y: 500, z: -5000 }, { x: 1000, y: 600, z: -5200 },
                { x: 2000, y: 700, z: -5400 }, { x: 3000, y: 800, z: -5600 },
                { x: 4000, y: 900, z: -5800 }, { x: 5000, y: 1000, z: -6000 },
            ],
            interpretation: 'normal' as const,
            throw: 800,
        },
        {
            id: 'F2', name: 'Antithetic Fault',
            points: [
                { x: 2000, y: 100, z: -4800 }, { x: 2400, y: 300, z: -5000 },
                { x: 2800, y: 500, z: -5200 }, { x: 3200, y: 700, z: -5400 },
            ],
            interpretation: 'normal' as const,
            throw: 450,
        },
    ]);
    const [sgrVshale, setSgrVshale] = useState(0.35);
    const [sgrBedThickness, setSgrBedThickness] = useState(70);
    const [sgrThrowFt, setSgrThrowFt] = useState(800);
    const [cspClayThickness, setCspClayThickness] = useState(25);
    const [cspDepthFt, setCspDepthFt] = useState(5500);

    // ── Horizon / Surface Parameters ────────────────────────────────────────
    const [horizons, setHorizons] = useState<Horizon[]>([
        {
            id: 'H1', name: 'Top Reservoir',
            surfaceData: Array.from({ length: 36 }, (_, i) => ({
                x: (i % 6) * 1000, y: Math.floor(i / 6) * 1000,
                z: -4600 - 200 * Math.sin((i % 6) * 0.4) - 150 * Math.cos(Math.floor(i / 6) * 0.5),
            })),
            wellTiePoints: [
                { wellId: 'W-1', x: 1500, y: 1500, z: -4752 },
                { wellId: 'W-2', x: 3500, y: 3500, z: -4910 },
            ],
            type: 'top' as const,
        },
        {
            id: 'H2', name: 'Base Reservoir',
            surfaceData: Array.from({ length: 36 }, (_, i) => ({
                x: (i % 6) * 1000, y: Math.floor(i / 6) * 1000,
                z: -5200 - 300 * Math.sin((i % 6) * 0.35) - 200 * Math.cos(Math.floor(i / 6) * 0.45),
            })),
            wellTiePoints: [
                { wellId: 'W-1', x: 1500, y: 1500, z: -5340 },
                { wellId: 'W-2', x: 3500, y: 3500, z: -5480 },
            ],
            type: 'base' as const,
        },
    ]);
    const [surfaceFittingAlgo, setSurfaceFittingAlgo] = useState<'idw' | 'min-curvature' | 'kriging'>('min-curvature');

    // ── Zone / Layering Parameters ──────────────────────────────────────────
    const [zones, setZones] = useState<Zone[]>([
        { id: 'Z1', name: 'Upper Sand', topDepth: 4700, baseDepth: 4900, layeringScheme: 'proportional' as const, nLayers: 12 },
        { id: 'Z2', name: 'Middle Heterolithic', topDepth: 4900, baseDepth: 5150, layeringScheme: 'follow-top' as const, nLayers: 18 },
        { id: 'Z3', name: 'Lower Sand', topDepth: 5150, baseDepth: 5380, layeringScheme: 'proportional' as const, nLayers: 14 },
    ]);
    const [totalNLayers, setTotalNLayers] = useState(44);

    // ── Variogram Parameters (by zone) ───────────────────────────────────────
    const [variogramZones, setVariogramZones] = useState<Record<string, VariogramParams>>({
        Z1: { range: 800, sill: 0.7, nugget: 0.08, azimuth: 45, anisotropyRatio: 0.55, model: 'spherical' },
        Z2: { range: 600, sill: 0.65, nugget: 0.12, azimuth: 50, anisotropyRatio: 0.4, model: 'exponential' },
        Z3: { range: 950, sill: 0.72, nugget: 0.06, azimuth: 40, anisotropyRatio: 0.6, model: 'gaussian' },
    });
    const [selectedZoneVg, setSelectedZoneVg] = useState('Z1');

    // ── Facies Modeling Parameters ──────────────────────────────────────────
    const [faciesAlgo, setFaciesAlgo] = useState<'sis' | 'tgs' | 'object' | 'mps'>('sis');
    const [nRealizations, setNRealizations] = useState(50);
    const [currentRealization, setCurrentRealization] = useState(1);
    const [channelGeom, setChannelGeom] = useState<ChannelGeometry>({
        width: 400, thickness: 20, sinuosity: 1.35, amplitude: 300, orientation: 45,
    });
    const [nChannels, setNChannels] = useState(5);
    const [tgsMean, setTgsMean] = useState(0);
    const [tgsStd, setTgsStd] = useState(1);
    const [tgsThresholds, setTgsThresholds] = useState([
        { code: 4, threshold: -1.0 },
        { code: 3, threshold: -0.3 },
        { code: 2, threshold: 0.5 },
        { code: 1, threshold: 1.2 },
    ]);
    const [faciesProportions, setFaciesProportions] = useState([
        { code: 1, proportion: 0.2 }, { code: 2, proportion: 0.1 },
        { code: 3, proportion: 0.15 }, { code: 4, proportion: 0.45 }, { code: 5, proportion: 0.1 },
    ]);

    // ── Depositional Model ──────────────────────────────────────────────────
    const [depoModel, setDepoModel] = useState(DEPOSITIONAL_ENVS[0]);

    // ── Petrophysical Parameters ────────────────────────────────────────────
    const [petroParams, setPetroParams] = useState<Record<string, PetrophysicalParams>>({
        '1': { porosityMean: 0.22, porosityStd: 0.04, permMean: 2.5, permStd: 0.6, kvKh: 0.15, swirr: 0.15, ntgCutoff: 0.06 },
        '2': { porosityMean: 0.15, porosityStd: 0.05, permMean: 1.3, permStd: 0.7, kvKh: 0.05, swirr: 0.25, ntgCutoff: 0.05 },
        '3': { porosityMean: 0.1, porosityStd: 0.03, permMean: 0.4, permStd: 0.5, kvKh: 0.02, swirr: 0.4, ntgCutoff: 0.04 },
        '4': { porosityMean: 0.04, porosityStd: 0.02, permMean: -0.5, permStd: 0.4, kvKh: 0.01, swirr: 0.7, ntgCutoff: 0.03 },
        '5': { porosityMean: 0.26, porosityStd: 0.03, permMean: 3.2, permStd: 0.5, kvKh: 0.3, swirr: 0.1, ntgCutoff: 0.07 },
    });
    const [selectedFaciesForPetro, setSelectedFaciesForPetro] = useState('1');
    const [saturationParams, setSaturationParams] = useState<SaturationHeightParams>({
        fwl: -5450, pcEntry: 1.2, lambda: 1.8, swirr: 0.15, rhoDiff: 0.23,
    });
    const [seismicCorrelation, setSeismicCorrelation] = useState(0.72);
    const [bo, setBo] = useState(1.25);
    const [bg, setBg] = useState(0.0048);
    const [gridSize, setGridSize] = useState(20);

    // ── Tab Navigation ──────────────────────────────────────────────────────
    const tabs = [
        { id: 'structural' as const, name: '1. Structural', icon: MapIcon },
        { id: 'stratigraphic' as const, name: '2. Stratigraphy', icon: Layers },
        { id: 'facies' as const, name: '3. Facies', icon: GitMerge },
        { id: 'petrophysical' as const, name: '4. Petrophysics', icon: Cpu },
        { id: 'volumetrics' as const, name: '5. Volumetrics', icon: Calculator },
    ];

    // ── Core Calculations (Memoized) ───────────────────────────────────────

    // Triangulate fault planes
    const faultPlanes = useMemo(() => faultSticks.map(s => triangulateFaultPlane(s)), [faultSticks]);

    // SGR / CSP / Transmissibility
    const sgrValue = useMemo(() => computeSGR(sgrVshale, sgrThrowFt, sgrBedThickness), [sgrVshale, sgrThrowFt, sgrBedThickness]);
    const cspValue = useMemo(() => computeCSP(sgrThrowFt, cspClayThickness, cspDepthFt), [sgrThrowFt, cspClayThickness, cspDepthFt]);
    const transMultiplier = useMemo(() => faultTransmissibilityFromSGR(sgrValue), [sgrValue]);

    // Juxtaposition analysis
    const juxtaposition = useMemo(() => {
        const h0 = horizons[0]; // top
        const h1 = horizons[1]; // base
        if (!h0 || !h1) return { overlapped: false, overlapThickness: 0, sandOnSand: false };
        const avgZ0 = h0.surfaceData.reduce((s, p) => s + p.z, 0) / h0.surfaceData.length;
        const avgZ1 = h1.surfaceData.reduce((s, p) => s + p.z, 0) / h1.surfaceData.length;
        return computeJuxtapositionOverlap(
            { topZ: avgZ0 - 100, baseZ: avgZ0 + 200 },
            { topZ: avgZ1 - 100, baseZ: avgZ1 + 200 },
            faultSticks[0]?.throw ?? 500,
        );
    }, [horizons, faultSticks]);

    // Variogram data for plot
    const variogramCurves = useMemo(() => {
        const curves: Record<string, { h: number; gamma: number }[]> = {};
        for (const [zoneId, vg] of Object.entries(variogramZones)) {
            const pts: { h: number; gamma: number }[] = [];
            for (let h = 0; h <= vg.range * 2.5; h += vg.range / 25) {
                pts.push({ h, gamma: variogramGamma(h, vg) });
            }
            curves[zoneId] = pts;
        }
        return curves;
    }, [variogramZones]);

    // Isochore surface
    const isochoreGrid = useMemo(() => {
        if (horizons.length < 2) return [];
        const topH = horizons[0], baseH = horizons[1];
        const grid: { x: number; y: number; isochore: number }[] = [];
        for (let ix = 0; ix < gridSize; ix++) {
            for (let iy = 0; iy < gridSize; iy++) {
                const x = ix * (5000 / gridSize);
                const y = iy * (5000 / gridSize);
                const isochore = computeIsochore(topH.surfaceData, baseH.surfaceData, x, y);
                grid.push({ x, y, isochore });
            }
        }
        return grid;
    }, [horizons, gridSize]);

    // Well tie misties
    const misties = useMemo(() => {
        const results: { wellId: string; horizonId: string; surfaceZ: number; markerZ: number; mistie: number; adjustment: number }[] = [];
        for (const h of horizons) {
            for (const wp of h.wellTiePoints) {
                const surfZ = minimumCurvatureInterpolation(h.surfaceData, wp.x, wp.y);
                const { mistie, adjustment } = computeMistie(surfZ, wp.z);
                results.push({ wellId: wp.wellId, horizonId: h.id, surfaceZ: surfZ, markerZ: wp.z, mistie, adjustment });
            }
        }
        return results;
    }, [horizons]);

    // Facies grids
    const faciesGrid = useMemo(() => {
        const size = gridSize;
        const wellData = [
            { x: 500, y: 500, faciesCode: 1 }, { x: 2500, y: 1500, faciesCode: 2 },
            { x: 4000, y: 3000, faciesCode: 5 }, { x: 1000, y: 3500, faciesCode: 3 },
            { x: 3000, y: 800, faciesCode: 4 },
        ];
        const vg = variogramZones[selectedZoneVg] ?? variogramZones.Z1;
        switch (faciesAlgo) {
            case 'sis':
                return sequentialIndicatorSimulation(size, size, wellData, faciesProportions, vg, currentRealization * 53 + 7);
            case 'tgs':
                return truncatedGaussianSimulation(size, size, tgsMean, tgsStd, tgsThresholds, currentRealization * 53 + 13);
            case 'object': {
                const channels = generateChannelObjects(5000, 5000, nChannels, channelGeom, currentRealization * 53 + 19);
                // Build object-based grid
                const row = (): number[] => {
                    const arr: number[] = Array(size).fill(4); // floodplain default
                    return arr;
                };
                const objGrid: number[][] = Array.from({ length: size }, () => row().slice());
                const dx = 5000 / size;
                for (const ch of channels) {
                    const cx = ch.x / dx;
                    const cy = ch.y / dx;
                    const hw = ch.width / dx / 2;
                    const oriRad = ch.orientation * Math.PI / 180;
                    for (let iy = 0; iy < size; iy++) {
                        for (let ix = 0; ix < size; ix++) {
                            const lx = ix - cx, ly = iy - cy;
                            const dAlong = Math.abs(lx * Math.cos(-oriRad) + ly * Math.sin(-oriRad));
                            const dPerp = Math.abs(-lx * Math.sin(-oriRad) + ly * Math.cos(-oriRad));
                            const sinOffset = Math.sin(dAlong * 0.15) * channelGeom.amplitude / dx;
                            if (dPerp + Math.abs(sinOffset) < hw) objGrid[iy][ix] = 1;
                        }
                    }
                }
                return objGrid;
            }
            case 'mps': {
                const ti: number[][] = [
                    [1, 1, 1, 2, 3, 4],
                    [1, 1, 2, 2, 3, 4],
                    [2, 2, 3, 3, 4, 4],
                    [1, 1, 2, 3, 3, 4],
                    [1, 2, 2, 3, 4, 4],
                    [1, 1, 1, 2, 3, 3],
                ];
                const seedGrid: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));
                for (const w of wellData) {
                    const ix = Math.min(size - 1, Math.max(0, Math.round(w.x / (5000 / size))));
                    const iy = Math.min(size - 1, Math.max(0, Math.round(w.y / (5000 / size))));
                    seedGrid[iy][ix] = w.faciesCode;
                }
                return multiPointStatisticsSimulation(seedGrid, ti, 3, currentRealization * 53 + 31);
            }
            default:
                return Array.from({ length: size }, () => Array(size).fill(1));
        }
    }, [faciesAlgo, gridSize, faciesProportions, channelGeom, nChannels, tgsMean, tgsStd, tgsThresholds, currentRealization, variogramZones, selectedZoneVg]);

    // Facies proportion curve
    const faciesPropCurve = useMemo(() => {
        const classified: { depth: number; faciesCode: number }[] = [];
        const rng = seededRandom(42);
        for (let d = 4600; d <= 5400; d += 20) {
            classified.push({ depth: d, faciesCode: Math.ceil(rng() * 5) });
        }
        const bins = zones.map(z => (z.topDepth + z.baseDepth) / 2);
        return computeFaciesProportions(classified, bins, [1, 2, 3, 4, 5]);
    }, [zones]);

    // Petrophysical grids (SGS / Co-Kriging)
    const { porosityGrid, permGrid, swGrid, ntgGrid } = useMemo(() => {
        const size = gridSize;
        const wellData = [
            { x: 500, y: 500, value: 0.22 }, { x: 2500, y: 1500, value: 0.15 },
            { x: 4000, y: 3000, value: 0.28 }, { x: 1000, y: 3500, value: 0.1 },
            { x: 3000, y: 800, value: 0.05 },
        ];
        const wellCoData = wellData.map(w => ({
            ...w,
            primary: w.value,
            secondary: w.value + (seededRandom(11 + w.x)() - 0.5) * 0.04,
        }));
        const vg = variogramZones[selectedZoneVg] ?? variogramZones.Z1;

        // Simulated seismic grid
        const seismic: number[][] = Array.from({ length: size }, () => Array(size).fill(0.18));
        for (let iy = 0; iy < size; iy++)
            for (let ix = 0; ix < size; ix++)
                seismic[iy][ix] = 0.14 + 0.1 * Math.sin(ix * 0.3) * Math.cos(iy * 0.25) + (seededRandom(ix + iy * size)() - 0.5) * 0.04;

        const porGrid = collocatedCoKriging(size, size, wellCoData, seismic, seismicCorrelation, vg);

        // Perm grid from porosity-perm transform based on facies
        const pGrid: number[][] = Array.from({ length: size }, () => Array(size).fill(1));
        for (let iy = 0; iy < size; iy++) {
            for (let ix = 0; ix < size; ix++) {
                const por = porGrid[iy]?.[ix] ?? 0.12;
                const faciesCode = faciesGrid[iy]?.[ix] ?? 4;
                pGrid[iy][ix] = porosityPermTransform(por, faciesCode);
            }
        }

        // Sw from saturation height
        const swG: number[][] = Array.from({ length: size }, () => Array(size).fill(1));
        for (let iy = 0; iy < size; iy++) {
            for (let ix = 0; ix < size; ix++) {
                const z = -4800 - (iy / size) * 800;
                const hAboveFWL = Math.max(0, z - saturationParams.fwl);
                swG[iy][ix] = saturationHeight(hAboveFWL, saturationParams);
            }
        }

        // NTG
        const ntgG: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
        for (let iy = 0; iy < size; iy++) {
            for (let ix = 0; ix < size; ix++) {
                const faciesCode = faciesGrid[iy]?.[ix] ?? 4;
                const cutoff = petroParams[String(faciesCode)]?.ntgCutoff ?? 0.05;
                ntgG[iy][ix] = computeNTG(porGrid[iy]?.[ix] ?? 0, cutoff);
            }
        }

        return { porosityGrid: porGrid, permGrid: pGrid, swGrid: swG, ntgGrid: ntgG };
    }, [gridSize, faciesGrid, seismicCorrelation, saturationParams, variogramZones, selectedZoneVg, petroParams]);

    // Volumetric calculation
    const volumetricResult = useMemo(() => {
        const size = gridSize;
        const cellAreaAcres = (5000 / size) * (5000 / size) / 43560;
        const cellThickness = 200;
        const cellVolAcreFt = cellAreaAcres * cellThickness;
        const porGrid3D: number[][][] = [Array.from({ length: size }, (_, j) => [...(porosityGrid[j] ?? [])])];
        const swGrid3D: number[][][] = [Array.from({ length: size }, (_, j) => [...(swGrid[j] ?? [])])];
        const ntgGrid3D: number[][][] = [Array.from({ length: size }, (_, j) => [...(ntgGrid[j] ?? [])])];
        return cellByCellVolumetrics(size, size, 1, porGrid3D, swGrid3D, ntgGrid3D, cellVolAcreFt, bo, bg);
    }, [porosityGrid, swGrid, ntgGrid, gridSize, bo, bg]);

    // Tornado chart data
    const tornadoData = useMemo((): TornadoEntry[] => {
        const base = volumetricResult.stoip;
        const perturb = (factor: number) => {
            const altBo = bo * factor;
            const altCellVol = (5000 / gridSize) * (5000 / gridSize) * 200 / 43560;
            const porAvg = porosityGrid.reduce((s, row) => s + row.reduce((a, v) => a + v, 0) / row.length, 0) / porosityGrid.length;
            const swAvg = swGrid.reduce((s, row) => s + row.reduce((a, v) => a + v, 0) / row.length, 0) / swGrid.length;
            const ntgAvg = ntgGrid.reduce((s, row) => s + row.reduce((a, v) => a + v, 0) / row.length, 0) / ntgGrid.length;
            return altCellVol * porosityGrid.length * porAvg * (1 - swAvg) * ntgAvg * 7758 / altBo;
        };
        return [
            { parameter: 'Oil FVF (Bo)', lowValue: bo * 0.9, baseValue: bo, highValue: bo * 1.1, lowVolume: perturb(0.9), highVolume: perturb(1.1) },
            { parameter: 'Porosity (±2σ)', lowValue: 0.9, baseValue: 1, highValue: 1.1, lowVolume: base * 0.85, highVolume: base * 1.15 },
            { parameter: 'Water Sat (±2σ)', lowValue: 0.9, baseValue: 1, highValue: 1.1, lowVolume: base * 1.12, highVolume: base * 0.88 },
            { parameter: 'NTG (±2σ)', lowValue: 0.9, baseValue: 1, highValue: 1.1, lowVolume: base * 0.82, highVolume: base * 1.18 },
            { parameter: 'GRV (±20%)', lowValue: 0.8, baseValue: 1, highValue: 1.2, lowVolume: base * 0.8, highVolume: base * 1.2 },
        ];
    }, [volumetricResult, bo, porosityGrid, swGrid, ntgGrid, gridSize]);

    // Realizations for volume distribution
    const volumeDistribution = useMemo((): VolumeDistribution => {
        const realizations: number[] = [];
        const rng = seededRandom(99);
        const baseStoip = volumetricResult.stoip;
        for (let i = 0; i < 100; i++) {
            realizations.push(baseStoip * (0.7 + rng() * 0.6));
        }
        realizations.sort((a, b) => a - b);
        return {
            p10: realizations[10],
            p50: realizations[50],
            p90: realizations[90],
            mean: realizations.reduce((a, b) => a + b, 0) / realizations.length,
            realizations,
        };
    }, [volumetricResult]);

    // Seismic attribute horizon for co-kriging display
    const seismicGrid = useMemo(() => {
        const size = gridSize;
        return Array.from({ length: size }, (_, iy) =>
            Array.from({ length: size }, (_, ix) =>
                0.14 + 0.1 * Math.sin(ix * 0.3) * Math.cos(iy * 0.25) + (seededRandom(ix + iy * size)() - 0.5) * 0.04
            )
        );
    }, [gridSize]);

    // ──────────────────────────────────────────────────────────────────────────
    // Render: Structural Tab
    // ──────────────────────────────────────────────────────────────────────────
    const renderStructural = () => (
        <div className="space-y-8">
            {/* Fault Modeling Section */}
            <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                <SectionHeading icon={Scissors} title="Fault Model Construction" subtitle="Triangulation, SGR/CSP, Juxtaposition & Transmissibility" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Fault Stick Import & Triangulation */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Target size={14} className="text-amber-500" /> Fault Sticks & Planes
                        </h4>
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 max-h-[300px] overflow-y-auto">
                            {faultSticks.map(fs => {
                                const plane = faultPlanes.find(p => p.id === fs.id);
                                return (
                                    <div key={fs.id} className="mb-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-black text-white italic">{fs.name}</p>
                                            <span className="text-[11px] font-black text-amber-400 uppercase">{fs.interpretation}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                                            <span>Dip: {plane?.dip.toFixed(1) ?? '-'}°</span>
                                            <span>Azi: {plane?.azimuth.toFixed(1) ?? '-'}°</span>
                                            <span>Triangles: {plane?.triangles.length ?? 0}</span>
                                            <span>Throw: {fs.throw} ft</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Fault Sticks → Delaunay Triangulation → 3D Plane Meshes</p>
                    </div>

                    {/* SGR / CSP / Transmissibility */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-amber-500" /> SGR / CSP / Transmissibility
                        </h4>
                        <ParamSlider label="Vshale" value={sgrVshale} min={0} max={1} step={0.01} unit="frac" onChange={setSgrVshale} precision={3} />
                        <ParamSlider label="Bed Thickness" value={sgrBedThickness} min={5} max={200} step={1} unit="ft" onChange={setSgrBedThickness} precision={0} />
                        <ParamSlider label="Fault Throw" value={sgrThrowFt} min={50} max={5000} step={10} unit="ft" onChange={setSgrThrowFt} precision={0} />
                        <ParamSlider label="Clay Thickness (CSP)" value={cspClayThickness} min={1} max={100} step={1} unit="ft" onChange={setCspClayThickness} precision={0} />
                        <ParamSlider label="Depth (CSP)" value={cspDepthFt} min={1000} max={20000} step={50} unit="ft" onChange={setCspDepthFt} precision={0} />

                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">SGR</p>
                                <p className="text-sm font-black text-amber-400 font-mono">{formatNumber(sgrValue, 4)}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">CSP</p>
                                <p className="text-sm font-black text-emerald-400 font-mono">{formatNumber(cspValue, 4)}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">T multiplier</p>
                                <p className="text-sm font-black text-blue-400 font-mono">{formatNumber(transMultiplier, 4)}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">Manzocchi et al. 1999: T = (1 - SGR)³</p>
                    </div>

                    {/* Juxtaposition Analysis */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Crosshair size={14} className="text-amber-500" /> Juxtaposition Analysis
                        </h4>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Footwall → Hangwall Overlap</span>
                                {juxtaposition.overlapped
                                    ? <CheckCircle2 size={18} className="text-emerald-500" />
                                    : <AlertOctagon size={18} className="text-red-500" />}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <p className="text-slate-500 uppercase font-black">Overlap Thickness</p>
                                    <p className="text-white font-mono font-black">{formatNumber(juxtaposition.overlapThickness, 1)} ft</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <p className="text-slate-500 uppercase font-black">Sand-on-Sand</p>
                                    <p className={`font-mono font-black ${juxtaposition.sandOnSand ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {juxtaposition.sandOnSand ? 'YES' : 'NO'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            <p className="text-[11px] font-black text-amber-400 flex items-center gap-2">
                                <AlertTriangle size={12} />
                                Fault-fault relationships: {faultSticks.length > 1 ? 'Branching detected - F1 truncates F2' : 'Single fault'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Horizon Modeling Section */}
            <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                <SectionHeading icon={Waves} title="Horizon Modeling & Surface Fitting" subtitle="Seismic depth surfaces, well ties, isochore generation" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Surface fitting algorithm selection and well ties */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {(['idw', 'min-curvature', 'kriging'] as const).map(algo => (
                                <button key={algo}
                                    onClick={() => setSurfaceFittingAlgo(algo)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                                        surfaceFittingAlgo === algo
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                            : "bg-white/5 text-slate-500 hover:text-white border border-white/10"
                                    )}
                                >
                                    {algo === 'idw' ? 'IDW' : algo === 'min-curvature' ? 'Min Curvature' : 'Kriging'}
                                </button>
                            ))}
                        </div>
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 max-h-[250px] overflow-y-auto space-y-2">
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Well-to-Seismic Tie Misties</p>
                            {misties.map((m, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-white/[0.03] rounded-lg text-[11px]">
                                    <span className="text-white font-black">{m.wellId} → {m.horizonId}</span>
                                    <span className={cn("font-mono font-black", Math.abs(m.mistie) < 5 ? "text-emerald-400" : "text-amber-400")}>
                                        Mistie: {formatNumber(m.mistie, 1)} ft
                                    </span>
                                    <span className="text-slate-500 font-mono">Adj: {formatNumber(m.adjustment, 1)} ft</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-600 italic">Surface fitting via {surfaceFittingAlgo}. Well markers honored to within tolerance.</p>
                    </div>

                    {/* Isochore map */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} className="text-amber-500" /> Isochore (Thickness) Map
                        </h4>
                        <ParamSlider label="Grid Resolution" value={gridSize} min={8} max={40} step={2} unit="cells" onChange={setGridSize} precision={0} hint="Higher values = finer grid, more compute" />
                        <div className="relative h-[280px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="absolute inset-0 flex flex-wrap" style={{ padding: '1px' }}>
                                {isochoreGrid.slice(0, gridSize * gridSize).map((cell, idx) => {
                                    const minI = Math.min(...isochoreGrid.map(c => c.isochore));
                                    const maxI = Math.max(...isochoreGrid.map(c => c.isochore));
                                    const t = maxI > minI ? (cell.isochore - minI) / (maxI - minI) : 0;
                                    return (
                                        <div
                                            key={idx}
                                            className="border border-white/[0.02]"
                                            style={{
                                                width: `${100 / gridSize}%`,
                                                height: `${100 / gridSize}%`,
                                                backgroundColor: `hsl(${Math.round(40 + t * 80)},80%,${Math.round(20 + t * 45)}%)`,
                                                opacity: 0.7 + t * 0.3,
                                            }}
                                            title={`X: ${cell.x.toFixed(0)}, Y: ${cell.y.toFixed(0)}, Thickness: ${cell.isochore.toFixed(1)} ft`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="absolute bottom-3 right-3 text-[10px] font-black text-white/40 uppercase">
                                Min: {Math.min(...isochoreGrid.map(c => c.isochore)).toFixed(0)} ft — Max: {Math.max(...isochoreGrid.map(c => c.isochore)).toFixed(0)} ft
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone & Layering */}
                <div className="mt-6 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Grid3X3 size={14} className="text-amber-500" /> Zone & Layering Scheme
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {zones.map(zone => (
                            <div key={zone.id} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-black text-white italic">{zone.name}</p>
                                    <span className="text-[11px] font-black text-amber-400 capitalize">{zone.layeringScheme}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                    <div className="p-2 bg-black/30 rounded-lg">
                                        <p className="text-slate-500">Top</p>
                                        <p className="text-white font-black">{formatNumber(zone.topDepth, 0)} ft</p>
                                    </div>
                                    <div className="p-2 bg-black/30 rounded-lg">
                                        <p className="text-slate-500">Base</p>
                                        <p className="text-white font-black">{formatNumber(zone.baseDepth, 0)} ft</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Layers: {zone.nLayers}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Avg Thk: {formatNumber((zone.baseDepth - zone.topDepth) / zone.nLayers, 1)} ft</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Simulation Layers</span>
                        <div className="flex items-center gap-3">
                            <input type="number" value={totalNLayers} onChange={e => setTotalNLayers(Number(e.target.value))}
                                className="w-20 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-white text-right" />
                            <span className="text-[11px] text-amber-400 font-black">layers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ──────────────────────────────────────────────────────────────────────────
    // Render: Stratigraphic Tab
    // ──────────────────────────────────────────────────────────────────────────
    const renderStratigraphic = () => (
        <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                <SectionHeading icon={Globe} title="Sequence Stratigraphic & Depositional Framework" subtitle="Key surfaces, depositional models, facies scheme, correlation panels" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Depositional Model */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <PenLine size={14} className="text-amber-500" /> Depositional Model
                        </h4>
                        <div className="space-y-2">
                            {DEPOSITIONAL_ENVS.map(env => (
                                <button
                                    key={env.type}
                                    onClick={() => setDepoModel(env)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border text-left transition-all",
                                        depoModel.type === env.type
                                            ? "bg-amber-500/10 border-amber-500/30"
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white italic">{env.name}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Cont: {env.continuity}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                                        <span className="text-slate-500">NTG: <span className="text-amber-400 font-mono">{env.ntg}</span></span>
                                        <span className="text-slate-500">Width: <span className="text-amber-400 font-mono">{formatNumber(env.w, 0)} ft</span></span>
                                        <span className="text-slate-500">Thickness: <span className="text-amber-400 font-mono">{env.t} ft</span></span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sequence Surfaces / Flooding */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-amber-500" /> Key Stratigraphic Surfaces
                        </h4>
                        <div className="space-y-2">
                            {[
                                { name: 'MFS-1 (Cenomanian)', type: 'maximum-flooding', depth: 4850, age: 94 },
                                { name: 'SB-2 (Turonian Base)', type: 'sequence-boundary', depth: 5050, age: 91 },
                                { name: 'TS-1 Transgressive', type: 'transgressive', depth: 5200, age: 88 },
                                { name: 'FS-1 Top Condensed', type: 'flooding-surface', depth: 5350, age: 85 },
                            ].map(sf => (
                                <div key={sf.name} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white">{sf.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{sf.type} · {sf.age} Ma</p>
                                    </div>
                                    <p className="text-xs font-mono font-black text-amber-400">{formatNumber(sf.depth, 0)} ft</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <p className="text-[11px] font-black text-blue-400 flex items-center gap-2">
                                <Zap size={12} /> Correlated across 12 wells with average mistie less than 3 ft
                            </p>
                        </div>
                    </div>
                </div>

                {/* Facies Scheme */}
                <div className="mt-6 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Facies Scheme Definition</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {FACIES_DEFS.map(f => (
                            <div key={f.code} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center space-y-2">
                                <div className="w-8 h-8 rounded-lg mx-auto" style={{ backgroundColor: f.color + '44', border: `2px solid ${f.color}` }} />
                                <p className="text-[10px] font-black text-white">{f.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase">Code {f.code}</p>
                                <p className="text-[10px] text-slate-600 italic">{f.depositionalEnvironment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Correlation Panel Concept */}
                <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 relative h-[200px] flex flex-col justify-end">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest absolute top-4 left-4">Well-to-Well Correlation Panel (Datum: MFS-1)</p>
                        <div className="flex justify-around items-end h-full pb-4">
                            {['W-1', 'W-2', 'W-3', 'W-4', 'W-5'].map((w, i) => (
                                <div key={w} className="w-10 bg-amber-500/20 rounded-t-lg border border-amber-500/30 flex flex-col justify-end"
                                    style={{ height: `${60 + Math.sin(i * 0.8) * 25}%` }}>
                                    <p className="text-[10px] font-black text-amber-400 text-center pb-1">{w}</p>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500/50" />
                        <p className="text-[10px] text-slate-600 text-center mt-2">Hanging stratigraphic cross-section from 3D model</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // ──────────────────────────────────────────────────────────────────────────
    // Render: Facies Tab
    // ──────────────────────────────────────────────────────────────────────────
    const renderFacies = () => (
        <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                <SectionHeading icon={GitMerge} title="Facies Modeling — Geostatistical Algorithms" subtitle="SIS · TGS · Object-Based · MPS | Multiple Realizations" />
                {/* Algorithm Selection & Parameters */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                            {([
                                { id: 'sis' as const, name: 'SIS' },
                                { id: 'tgs' as const, name: 'TGS' },
                                { id: 'object' as const, name: 'Object-Based' },
                                { id: 'mps' as const, name: 'MPS' },
                            ]).map(algo => (
                                <button key={algo.id}
                                    onClick={() => setFaciesAlgo(algo.id)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        faciesAlgo === algo.id
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                            : "bg-white/5 text-slate-500 hover:text-white border border-white/10"
                                    )}
                                >
                                    {algo.name}
                                </button>
                            ))}
                        </div>

                        {faciesAlgo === 'object' && (
                            <div className="space-y-3 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                <p className="text-[11px] font-black text-slate-400 uppercase">Channel Geometry</p>
                                <ParamSlider label="Width" value={channelGeom.width} min={50} max={2000} step={10} unit="ft" onChange={v => setChannelGeom({ ...channelGeom, width: v })} precision={0} />
                                <ParamSlider label="Thickness" value={channelGeom.thickness} min={2} max={100} step={1} unit="ft" onChange={v => setChannelGeom({ ...channelGeom, thickness: v })} precision={0} />
                                <ParamSlider label="Sinuosity" value={channelGeom.sinuosity} min={1} max={3} step={0.01} unit="" onChange={v => setChannelGeom({ ...channelGeom, sinuosity: v })} precision={2} />
                                <ParamSlider label="Amplitude" value={channelGeom.amplitude} min={50} max={1000} step={10} unit="ft" onChange={v => setChannelGeom({ ...channelGeom, amplitude: v })} precision={0} />
                                <ParamSlider label="Orientation" value={channelGeom.orientation} min={0} max={180} step={5} unit="°" onChange={v => setChannelGeom({ ...channelGeom, orientation: v })} precision={0} />
                            </div>
                        )}

                        {faciesAlgo === 'tgs' && (
                            <div className="space-y-3 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                <ParamSlider label="Gaussian Mean" value={tgsMean} min={-3} max={3} step={0.1} unit="" onChange={setTgsMean} precision={1} />
                                <ParamSlider label="Std Dev" value={tgsStd} min={0.1} max={3} step={0.1} unit="" onChange={setTgsStd} precision={1} />
                                {tgsThresholds.map((t, i) => (
                                    <div key={t.code} className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400">Facies {t.code} ≥</span>
                                        <input type="number" value={t.threshold}
                                            onChange={e => {
                                                const newThresh = [...tgsThresholds];
                                                newThresh[i] = { ...t, threshold: Number(e.target.value) };
                                                setTgsThresholds(newThresh);
                                            }}
                                            step={0.1}
                                            className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] font-mono text-white text-right" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Facies proportions (used by SIS) */}
                        <div className="space-y-2 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <p className="text-[11px] font-black text-slate-400 uppercase">Global Facies Proportions</p>
                            {faciesProportions.map((fp, i) => (
                                <div key={fp.code} className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">{FACIES_DEFS.find(f => f.code === fp.code)?.name ?? `Code ${fp.code}`}</span>
                                    <input type="number" value={fp.proportion}
                                        min={0} max={1} step={0.01}
                                        onChange={e => {
                                            const newProps = [...faciesProportions];
                                            newProps[i] = { ...fp, proportion: Number(e.target.value) };
                                            setFaciesProportions(newProps);
                                        }}
                                        className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] font-mono text-white text-right" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Realization Controls */}
                    <div className="space-y-4">
                        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Realizations</h4>
                            <ParamSlider label="Total Realizations" value={nRealizations} min={1} max={200} step={1} unit="" onChange={setNRealizations} precision={0} hint="Industry standard: 50-100+" />
                            <ParamSlider label="Current Realization" value={currentRealization} min={1} max={Math.max(1, nRealizations)} step={1} unit="" onChange={setCurrentRealization} precision={0} />
                            <select value={selectedZoneVg} onChange={e => setSelectedZoneVg(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-black">
                                {zones.map(z => (
                                    <option key={z.id} value={z.id}>{z.name} (Variogram)</option>
                                ))}
                            </select>
                        </div>

                        {/* Variogram plot */}
                        <div className="h-[180px] bg-black/40 rounded-2xl border border-white/5 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={variogramCurves[selectedZoneVg] ?? variogramCurves.Z1}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                    <XAxis dataKey="h" stroke="#475569" fontSize={8} />
                                    <YAxis stroke="#475569" fontSize={8} domain={[0, 'auto']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: 10 }} />
                                    {Object.keys(variogramCurves).map((zid, i) => (
                                        <Line key={zid} type="monotone" data={variogramCurves[zid]}
                                            dataKey="gamma"
                                            stroke={zid === selectedZoneVg ? '#f59e0b' : '#475569'}
                                            strokeWidth={zid === selectedZoneVg ? 3 : 1}
                                            dot={false}
                                            opacity={zid === selectedZoneVg ? 1 : 0.4}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Facies Grid Visualization */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">
                            {faciesAlgo.toUpperCase()} Facies Grid — Realization {currentRealization}/{nRealizations}
                        </h4>
                        <div className="relative bg-black/40 rounded-2xl border border-white/5 overflow-hidden"
                            style={{ height: `${Math.min(420, gridSize * 18)}px` }}>
                            <div className="flex flex-wrap" style={{ width: '100%', height: '100%' }}>
                                {faciesGrid.map((row, iy) =>
                                    row.map((code, ix) => (
                                        <div
                                            key={`${iy}-${ix}`}
                                            style={{
                                                width: `${100 / gridSize}%`,
                                                height: `${100 / gridSize}%`,
                                                backgroundColor: faciesColor(code),
                                                opacity: 0.7,
                                                border: '0.5px solid rgba(255,255,255,0.03)',
                                            }}
                                            title={`(${ix},${iy}) Facies: ${FACIES_DEFS.find(f => f.code === code)?.name ?? code}`}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {FACIES_DEFS.map(f => (
                                <div key={f.code} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: f.color }} />
                                    <span className="text-[10px] text-slate-400 font-black">{f.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Facies Proportion Curves */}
                <div className="h-[200px] bg-black/40 rounded-2xl border border-white/5 p-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 pt-1">Facies Proportion Curves by Depth</p>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={faciesPropCurve} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                            <XAxis type="number" domain={[0, 1]} stroke="#475569" fontSize={8} />
                            <YAxis type="number" dataKey="depth" domain={['auto', 'auto']} stroke="#475569" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: 10 }} />
                            {[1, 2, 3, 4, 5].map(code => (
                                <Area key={code} type="monotone"
                                    dataKey={(d: any) => {
                                        const prop = d.proportions?.find((p: any) => p.faciesCode === code);
                                        return prop?.proportion ?? 0;
                                    }}
                                    stackId="1"
                                    fill={faciesColor(code)}
                                    stroke={faciesColor(code)}
                                    opacity={0.7}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    // ──────────────────────────────────────────────────────────────────────────
    // Render: Petrophysical Tab
    // ──────────────────────────────────────────────────────────────────────────
    const renderPetrophysical = () => (
        <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                <SectionHeading icon={Cpu} title="Petrophysical Property Modeling" subtitle="SGS · Co-Kriging · Porosity-Perm · Saturation Height · NTG" />

                {/* Facies selector for petrophysics */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {Object.keys(petroParams).map(code => {
                        const f = FACIES_DEFS.find(fd => fd.code === Number(code));
                        return (
                            <button key={code}
                                onClick={() => setSelectedFaciesForPetro(code)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                    selectedFaciesForPetro === code
                                        ? "text-white shadow-lg"
                                        : "bg-white/5 text-slate-500 hover:text-white border border-white/10"
                                )}
                                style={selectedFaciesForPetro === code ? { backgroundColor: (f?.color ?? '#f59e0b') + '44', borderColor: f?.color ?? '#f59e0b' } : {}}
                            >
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: f?.color ?? '#f59e0b' }} />
                                {f?.name ?? `Facies ${code}`}
                            </button>
                        );
                    })}
                </div>

                {/* Facies-specific petrophysical params */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <ParamSlider label="φ Mean" value={petroParams[selectedFaciesForPetro]?.porosityMean ?? 0.15} min={0.01} max={0.4} step={0.01} unit="frac"
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], porosityMean: v } })} precision={3} />
                    <ParamSlider label="φ Std" value={petroParams[selectedFaciesForPetro]?.porosityStd ?? 0.04} min={0.001} max={0.15} step={0.001} unit="frac"
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], porosityStd: v } })} precision={3} />
                    <ParamSlider label="Perm Mean (log10)" value={petroParams[selectedFaciesForPetro]?.permMean ?? 1.5} min={-2} max={4.5} step={0.1} unit="mD"
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], permMean: v } })} precision={1} />
                    <ParamSlider label="Perm Std" value={petroParams[selectedFaciesForPetro]?.permStd ?? 0.5} min={0.05} max={2} step={0.05} unit=""
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], permStd: v } })} precision={2} />
                    <ParamSlider label="Kv/Kh" value={petroParams[selectedFaciesForPetro]?.kvKh ?? 0.1} min={0.001} max={1} step={0.001} unit=""
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], kvKh: v } })} precision={4} />
                    <ParamSlider label="Swirr" value={petroParams[selectedFaciesForPetro]?.swirr ?? 0.2} min={0.01} max={0.8} step={0.01} unit="frac"
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], swirr: v } })} precision={2} />
                    <ParamSlider label="NTG Cutoff" value={petroParams[selectedFaciesForPetro]?.ntgCutoff ?? 0.05} min={0.01} max={0.25} step={0.01} unit="frac"
                        onChange={v => setPetroParams({ ...petroParams, [selectedFaciesForPetro]: { ...petroParams[selectedFaciesForPetro], ntgCutoff: v } })} precision={2} />
                </div>

                {/* Co-Kriging params */}
                <div className="flex gap-4 items-end mb-6">
                    <ParamSlider label="Seismic Correlation Coeff" value={seismicCorrelation} min={0} max={1} step={0.01} unit="r" onChange={setSeismicCorrelation} precision={2} hint="Collocated co-kriging: ρ between acoustic impedance & porosity" />
                </div>

                {/* Grid visualization panels: Porosity, Perm, Sw, NTG */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: 'Porosity (φ)', grid: porosityGrid, scheme: 'por' as const, min: 0, max: 0.35, unit: 'frac', fmt: (v: number) => v.toFixed(3) },
                        { title: 'Permeability (k)', grid: permGrid.map(r => r.map(v => Math.log10(Math.max(0.001, v)))), scheme: 'perm' as const, min: -2, max: 4, unit: 'log10(mD)', fmt: (v: number) => Math.pow(10, v).toExponential(1) },
                        { title: 'Water Sat (Sw)', grid: swGrid, scheme: 'sw' as const, min: 0, max: 1, unit: 'frac', fmt: (v: number) => v.toFixed(3) },
                        { title: 'NTG', grid: ntgGrid, scheme: 'ntg' as const, min: 0, max: 1, unit: 'net/gross', fmt: (v: number) => v.toFixed(2) },
                    ].map((panel, pi) => (
                        <div key={pi} className="space-y-2">
                            <p className="text-[11px] font-black text-white uppercase tracking-wider">{panel.title}</p>
                            <div className="relative bg-black/40 rounded-xl border border-white/5 overflow-hidden" style={{ height: '180px' }}>
                                <div className="flex flex-wrap">
                                    {panel.grid.slice(0, gridSize).map((row, iy) =>
                                        row.slice(0, gridSize).map((val, ix) => (
                                            <div
                                                key={`${iy}-${ix}`}
                                                style={{
                                                    width: `${100 / Math.min(gridSize, row.length)}%`,
                                                    height: `${100 / Math.min(gridSize, panel.grid.length)}%`,
                                                    backgroundColor: propColor(val, panel.min, panel.max, panel.scheme),
                                                    border: '0.5px solid rgba(255,255,255,0.02)',
                                                }}
                                                title={`${panel.title}: ${panel.fmt(val)} ${panel.unit}`}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Saturation Height Parameters */}
                <div className="border-t border-white/5 pt-6">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Target size={14} className="text-amber-500" /> Saturation Height Function — Brooks-Corey
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <ParamSlider label="Free Water Level" value={saturationParams.fwl} min={-10000} max={-2000} step={10} unit="ft TVDSS" onChange={v => setSaturationParams({ ...saturationParams, fwl: v })} precision={0} hint="Deeper = more negative" />
                        <ParamSlider label="Entry Pressure (Pce)" value={saturationParams.pcEntry} min={0.1} max={10} step={0.1} unit="psi" onChange={v => setSaturationParams({ ...saturationParams, pcEntry: v })} precision={1} />
                        <ParamSlider label="Lambda (λ)" value={saturationParams.lambda} min={0.3} max={5} step={0.1} unit="" onChange={v => setSaturationParams({ ...saturationParams, lambda: v })} precision={1} hint="Pore size distribution index" />
                        <ParamSlider label="Swirr" value={saturationParams.swirr} min={0.01} max={0.4} step={0.01} unit="frac" onChange={v => setSaturationParams({ ...saturationParams, swirr: v })} precision={2} />
                        <ParamSlider label="Δρ (water-oil)" value={saturationParams.rhoDiff} min={0.05} max={0.5} step={0.01} unit="g/cc" onChange={v => setSaturationParams({ ...saturationParams, rhoDiff: v })} precision={2} />
                    </div>
                    {/* Sw vs Height curve */}
                    <div className="h-[200px] bg-black/40 rounded-2xl border border-white/5 p-2 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={Array.from({ length: 60 }, (_, i) => {
                                const h = i * 20;
                                const sw = saturationHeight(h, saturationParams);
                                return { h, sw };
                            })}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                <XAxis dataKey="h" stroke="#475569" fontSize={8} label={{ value: 'Height Above FWL (ft)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 9 }} />
                                <YAxis stroke="#475569" fontSize={8} domain={[0, 1]} label={{ value: 'Sw', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                                <ReferenceLine y={saturationParams.swirr} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Swirr', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: 10 }} />
                                <Area type="monotone" dataKey="sw" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    // ──────────────────────────────────────────────────────────────────────────
    // Render: Volumetrics Tab
    // ──────────────────────────────────────────────────────────────────────────
    const renderVolumetrics = () => {
        const v = volumetricResult;
        const d = volumeDistribution;
        const histData = d.realizations.map((vol, i) => ({ bin: i, volume: vol / 1e6 }));
        return (
            <div className="space-y-8">
                <div className="glass-card rounded-2xl p-8 border border-white/5 bg-[#05070a]/80">
                    <SectionHeading icon={Calculator} title="Volumetric Estimation" subtitle="STOIIP · GIIP · Probabilistic P10/P50/P90 · Tornado Sensitivity" />

                    {/* Key Result Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {[
                            { label: 'GRV', value: formatNumber(v.grv, 0), unit: 'acre-ft', color: 'amber' },
                            { label: 'NTG', value: v.ntg.toFixed(3), unit: 'frac', color: 'emerald' },
                            { label: 'Porosity (φ)', value: v.porosity.toFixed(3), unit: 'frac', color: 'blue' },
                            { label: 'Water Sat (Sw)', value: v.sw.toFixed(3), unit: 'frac', color: 'cyan' },
                            { label: 'Bo', value: bo.toFixed(3), unit: 'rb/stb', color: 'purple' },
                        ].map((card, i) => (
                            <div key={i} className={`p-4 bg-${card.color}-500/5 rounded-2xl border border-${card.color}-500/15 text-center`}>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                                <p className={`text-lg font-black text-${card.color}-400 font-mono mt-1`}>{card.value}</p>
                                <p className="text-[10px] text-slate-600">{card.unit}</p>
                            </div>
                        ))}
                    </div>

                    {/* STOIIP / GIIP main cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-center">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">STOIIP (Oil-In-Place)</p>
                            <p className="text-4xl font-black text-white italic font-mono tracking-tight mt-2">
                                {v.stoip >= 1e9
                                    ? `${(v.stoip / 1e9).toFixed(3)} B STB`
                                    : v.stoip >= 1e6
                                        ? `${(v.stoip / 1e6).toFixed(2)} MM STB`
                                        : `${(v.stoip / 1e3).toFixed(2)} M STB`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">{formatNumber(v.stoip, 0)} STB</p>
                            <p className="text-[11px] font-mono text-slate-600 mt-1">STOIIP = GRV × 7758 × NTG × φ × (1 − Sw) / Bo</p>
                        </div>
                        <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">GIIP (Gas-In-Place)</p>
                            <p className="text-4xl font-black text-white italic font-mono tracking-tight mt-2">
                                {v.giip >= 1e12
                                    ? `${(v.giip / 1e12).toFixed(3)} TCF`
                                    : v.giip >= 1e9
                                        ? `${(v.giip / 1e9).toFixed(2)} BCF`
                                        : `${(v.giip / 1e6).toFixed(2)} MMCF`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">{v.giip.toExponential(3)} SCF</p>
                            <p className="text-[11px] font-mono text-slate-600 mt-1">GIIP = GRV × 43560 × NTG × φ × (1 − Sw) / Bg</p>
                        </div>
                    </div>

                    {/* Probabilistic Volumes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Probabilistic Distribution (100 Realizations)</h4>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: 'P10 (Low)', value: d.p10, color: 'emerald' },
                                    { label: 'P50 (Median)', value: d.p50, color: 'amber' },
                                    { label: 'P90 (High)', value: d.p90, color: 'rose' },
                                ].map(stat => (
                                    <div key={stat.label} className={`p-3 bg-${stat.color}-500/5 rounded-xl border border-${stat.color}-500/15 text-center`}>
                                        <p className="text-[10px] font-black text-slate-500 uppercase">{stat.label}</p>
                                        <p className={`text-sm font-black font-mono text-${stat.color}-400`}>
                                            {stat.value >= 1e9 ? `${(stat.value / 1e9).toFixed(2)} B` :
                                                stat.value >= 1e6 ? `${(stat.value / 1e6).toFixed(1)} MM` :
                                                    `${(stat.value / 1e3).toFixed(1)} M`} STB
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[220px] bg-black/40 rounded-2xl border border-white/5 p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={histData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                        <XAxis dataKey="bin" hide />
                                        <YAxis fontSize={8} stroke="#475569" />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: 10 }}
                                            formatter={(val: number) => [`${val.toFixed(1)} MM STB`, 'Volume']} />
                                        <ReferenceLine x={10} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'P10', fill: '#10b981', fontSize: 9 }} />
                                        <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'P50', fill: '#f59e0b', fontSize: 9 }} />
                                        <ReferenceLine x={90} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'P90', fill: '#f43f5e', fontSize: 9 }} />
                                        <Bar dataKey="volume" fill="#f59e0b" opacity={0.7} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tornado Chart */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Tornado Sensitivity — STOIIP Drivers</h4>
                            <div className="h-[280px] bg-black/40 rounded-2xl border border-white/5 p-4">
                                <BarChart
                                    data={tornadoData}
                                    layout="vertical"
                                    margin={{ left: 100, right: 30 }}
                                    barCategoryGap="20%"
                                    barSize={24}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                    <XAxis type="number" stroke="#475569" fontSize={8} tickFormatter={v => `${(v / 1e6).toFixed(0)} MM`} />
                                    <YAxis dataKey="parameter" type="category" stroke="#475569" fontSize={9} width={90} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: 10 }}
                                        formatter={(val: number) => [formatNumber(val, 0) + ' STB', 'STOIIP']} />
                                    <Bar dataKey="lowVolume" fill="#10b981" name="Low Case" />
                                    <Bar dataKey="highVolume" fill="#f43f5e" name="High Case" />
                                </BarChart>
                            </div>
                            <p className="text-[10px] text-slate-500 italic text-center">Parameters most impacting volume uncertainty. GRV & NTG typically dominate.</p>
                        </div>
                    </div>

                    {/* Varying contacts sensitivity hint */}
                    <div className="mt-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center gap-3">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <div>
                            <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Contact Uncertainty Sensitivity</p>
                            <p className="text-[10px] text-slate-500">Vary OWC/GOC ±50 ft → re-run volumetric across all realizations. Consistent with map-based volumetrics from Sub-Step 1.5.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ──────────────────────────────────────────────────────────────────────────
    // Main Render
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Box className="text-amber-500" size={32} />
                        Geomodeling & Modeling <span className="text-amber-500/50 text-sm">Sub-Steps 2.5.1–2.5.5</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">
                        Structural · Stratigraphic · Facies · Petrophysical · Volumetric — Industrial Earth Modeling Engine
                    </p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 flex-wrap">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={cn(
                                "px-4 py-2 rounded-[14px] flex items-center gap-2 transition-all text-[11px] font-black uppercase tracking-widest",
                                activeTab === t.id
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            <t.icon size={12} />
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'structural' && renderStructural()}
                    {activeTab === 'stratigraphic' && renderStratigraphic()}
                    {activeTab === 'facies' && renderFacies()}
                    {activeTab === 'petrophysical' && renderPetrophysical()}
                    {activeTab === 'volumetrics' && renderVolumetrics()}
                </motion.div>
            </AnimatePresence>

            {/* Bottom Status Bar */}
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Faults: {faultPlanes.length} planes</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Horizons: {horizons.length} surfaces</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Zones: {zones.length} ({totalNLayers} layers)</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Facies Algo: {faciesAlgo.toUpperCase()}</span>
                    <span>Realizations: {currentRealization}/{nRealizations}</span>
                    <span className="text-amber-400">STOIIP: {formatNumber(volumetricResult.stoip, 0)} STB</span>
                </div>
            </div>
        </div>
    );
}

export default GeomodelingModule;