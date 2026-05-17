import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    Database,
    Hash,
    TrendingUp,
    SlidersHorizontal,
    BarChart3,
    Box,
    PieChart,
    AlertTriangle,
    Activity,
    Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { useAppraisal, useReserves } from '../../store/hooks';
import { useSimulationStore } from '../../store/simulationStore';

// -----------------------------------------------------------------------
// Deterministic STOIIP / GIIP
// -----------------------------------------------------------------------
function computeDeterministicVolumes(params: {
    grv: number;
    ntg: number;
    porosity: number;
    sw: number;
    bo: number;
    bg: number;
    hasGasCap: boolean;
    gasCapFraction: number;
    rfOil: number;
    rfGas: number;
}) {
    const { grv, ntg, porosity, sw, bo, bg, hasGasCap, gasCapFraction } = params;
    const netRockVolume = grv * ntg;
    const poreVolume = netRockVolume * porosity;
    const hydrocarbonPoreVolume = poreVolume * (1 - sw);

    let stoip = 0;
    let giip = 0;
    let gasCapGiip = 0;
    let totalGiip = 0;

    if (bo > 0) {
        stoip = hydrocarbonPoreVolume / bo;
    }
    if (bg > 0) {
        giip = hydrocarbonPoreVolume / bg;
        if (hasGasCap) {
            gasCapGiip = poreVolume * gasCapFraction * (1 - (sw * 0.4)) / bg;
            totalGiip = giip + gasCapGiip;
        } else {
            totalGiip = giip;
        }
    }

    return {
        stoipMMstb: stoip / 1e6,
        giipBscf: giip / 1e9,
        gasCapGiipBscf: gasCapGiip / 1e9,
        totalGiipBscf: totalGiip / 1e9,
        grvMmRB: grv / 1e6,
        poreVolumeMmRB: poreVolume / 1e6,
        hcpvMmRB: hydrocarbonPoreVolume / 1e6,
        recoveryOilMMstb: params.rfOil > 0 ? (stoip * params.rfOil) / 1e6 : 0,
        recoveryGasBscf: params.rfGas > 0 ? (totalGiip * params.rfGas) / 1e9 : 0,
    };
}

// -----------------------------------------------------------------------
// Probabilistic Volumes (Monte Carlo)
// -----------------------------------------------------------------------
interface VolDistribution {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    realizations: number[];
}

function runMonteCarloVolumes(baseParams: {
    grv: number;
    ntg: number;
    porosity: number;
    sw: number;
    bo: number;
    bg: number;
    rfOil: number;
    rfGas: number;
    hasGasCap: boolean;
    gasCapFraction: number;
}, nRealizations: number = 200): { stoipDist: VolDistribution; giipDist: VolDistribution; recoverableOilDist: VolDistribution; recoverableGasDist: VolDistribution } {
    const stoipSamples: number[] = [];
    const giipSamples: number[] = [];
    const recOilSamples: number[] = [];
    const recGasSamples: number[] = [];

    const gaussianRandom = (mean: number, std: number): number => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + z * std;
    };

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    for (let i = 0; i < nRealizations; i++) {
        const grv = clamp(gaussianRandom(baseParams.grv, baseParams.grv * 0.08), baseParams.grv * 0.7, baseParams.grv * 1.3);
        const ntg = clamp(gaussianRandom(baseParams.ntg, 0.08), 0.1, 1.0);
        const poro = clamp(gaussianRandom(baseParams.porosity, 0.025), 0.02, 0.40);
        const sw = clamp(gaussianRandom(baseParams.sw, 0.06), 0.05, 0.95);
        const bo = clamp(gaussianRandom(baseParams.bo, baseParams.bo * 0.1), 0.8, 3.0);
        const bg = clamp(gaussianRandom(baseParams.bg, baseParams.bg * 0.15), 0.001, 0.05);
        const rfOil = clamp(gaussianRandom(baseParams.rfOil, 0.06), 0.05, 0.65);
        const rfGas = clamp(gaussianRandom(baseParams.rfGas, 0.05), 0.3, 0.95);

        const stoip = (grv * ntg * poro * (1 - sw)) / bo;
        const giip = (grv * ntg * poro * (1 - sw)) / bg;
        const recOil = stoip * rfOil;
        const recGas = giip * rfGas;

        stoipSamples.push(stoip / 1e6);
        giipSamples.push(giip / 1e9);
        recOilSamples.push(recOil / 1e6);
        recGasSamples.push(recGas / 1e9);
    }

    const makeDist = (samples: number[]): VolDistribution => {
        const sorted = [...samples].sort((a, b) => a - b);
        const p10 = sorted[Math.floor(sorted.length * 0.1)];
        const p50 = sorted[Math.floor(sorted.length * 0.5)];
        const p90 = sorted[Math.floor(sorted.length * 0.9)];
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        return { p10, p50, p90, mean, realizations: sorted };
    };

    return {
        stoipDist: makeDist(stoipSamples),
        giipDist: makeDist(giipSamples),
        recoverableOilDist: makeDist(recOilSamples),
        recoverableGasDist: makeDist(recGasSamples),
    };
}

// -----------------------------------------------------------------------
// Tornado chart sensitivity
// -----------------------------------------------------------------------
interface TornadoBar {
    param: string;
    lowValue: number;
    highValue: number;
}

function computeTornado(baseParams: {
    grv: number; ntg: number; porosity: number; sw: number; bo: number; bg: number; rfOil: number; rfGas: number; hasGasCap: boolean; gasCapFraction: number;
}, baseStoip: number): TornadoBar[] {
    const calc = (overrides: Partial<typeof baseParams>) => {
        const p = { ...baseParams, ...overrides };
        return (p.grv * p.ntg * p.porosity * (1 - p.sw)) / p.bo / 1e6;
    };

    const sensitivities: { param: string; factor: number }[] = [
        { param: 'Porosity', factor: 0.2 },
        { param: 'NTG', factor: 0.25 },
        { param: 'GRV', factor: 0.15 },
        { param: 'Sw', factor: 0.2 },
        { param: 'Bo', factor: 0.15 },
    ];

    const bars: TornadoBar[] = [];
    for (const s of sensitivities) {
        const key = s.param === 'Porosity' ? 'porosity' : s.param === 'NTG' ? 'ntg' : s.param === 'GRV' ? 'grv' : s.param === 'Bo' ? 'bo' : 'sw';
        const baseVal = (baseParams as any)[key];
        let low: number, high: number;
        if (key === 'bo' || key === 'sw') {
            low = calc({ [key]: baseVal * (1 - s.factor) });
            high = calc({ [key]: baseVal * (1 + s.factor) });
        } else {
            low = calc({ [key]: baseVal * (1 - s.factor) });
            high = calc({ [key]: baseVal * (1 + s.factor) });
        }
        bars.push({ param: s.param, lowValue: low, highValue: high });
    }
    bars.sort((a, b) => Math.abs(b.highValue - b.lowValue) - Math.abs(a.highValue - a.lowValue));
    return bars;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------
export function VolumetricsModule() {
    // ──────────────── Store hooks ────────────────
    const { data: explorationData } = useSimulationStore(s => ({ data: s.exploration }));
    const { data: appraisalData, update: updateAppraisal, reset: resetAppraisal } = useAppraisal();
    const { data: reservesData, update: updateReserves, reset: resetReserves } = useReserves();
    const updateConnection = useSimulationStore(s => s.updateConnection);

    // ──────────────── Initialize params from upstream layers ────────────────
    const [phase, setPhase] = useState<'deterministic' | 'probabilistic' | 'tornado'>('deterministic');

    // Derive initial GRV from exploration or appraisal
    const initialGrv = useMemo(() => {
        const petro = appraisalData?.petrophysics;
        if (petro && Object.keys(petro).length > 0) {
            const firstWellId = Object.keys(petro)[0];
            const firstZoneId = Object.keys(petro[firstWellId])[0];
            if (firstZoneId && petro[firstWellId][firstZoneId]?.netPay) {
                return petro[firstWellId][firstZoneId].netPay! * 640 * 43560 / 1e6 * 1e6;
            }
        }
        const grvP50 = explorationData?.prospect?.grv?.p50;
        if (grvP50) return grvP50;
        return 2500e6;
    }, [appraisalData, explorationData]);

    const initialPorosity = useMemo(() => {
        const petro = appraisalData?.petrophysics;
        if (petro && Object.keys(petro).length > 0) {
            const firstWellId = Object.keys(petro)[0];
            const firstZoneId = Object.keys(petro[firstWellId])[0];
            return petro[firstWellId][firstZoneId]?.porosity ?? 0.18;
        }
        return 0.18;
    }, [appraisalData]);

    const initialSw = useMemo(() => {
        const petro = appraisalData?.petrophysics;
        if (petro && Object.keys(petro).length > 0) {
            const firstWellId = Object.keys(petro)[0];
            const firstZoneId = Object.keys(petro[firstWellId])[0];
            return petro[firstWellId][firstZoneId]?.waterSaturation ?? 0.32;
        }
        return 0.32;
    }, [appraisalData]);

    const initialNtg = useMemo(() => {
        const petro = appraisalData?.petrophysics;
        if (petro && Object.keys(petro).length > 0) {
            const firstWellId = Object.keys(petro)[0];
            const firstZoneId = Object.keys(petro[firstWellId])[0];
            return petro[firstWellId][firstZoneId]?.ntg ?? 0.65;
        }
        return 0.65;
    }, [appraisalData]);

    const initialBo = useMemo(() => {
        const pvt = appraisalData?.pvt;
        return pvt?.oilFVF ?? 1.25;
    }, [appraisalData]);

    const initialBg = useMemo(() => {
        const pvt = appraisalData?.pvt;
        return pvt?.gasFVF ?? 0.0045;
    }, [appraisalData]);

    const [params, setParams] = useState({
        grv: initialGrv,
        ntg: initialNtg,
        porosity: initialPorosity,
        sw: initialSw,
        bo: initialBo,
        bg: initialBg,
        rfOil: 0.35,
        rfGas: 0.70,
        hasGasCap: false,
        gasCapFraction: 0.15,
    });

    // Update params when upstream data changes
    useEffect(() => {
        setParams(prev => ({
            ...prev,
            grv: initialGrv,
            ntg: initialNtg,
            porosity: initialPorosity,
            sw: initialSw,
            bo: initialBo,
            bg: initialBg,
        }));
    }, [initialGrv, initialNtg, initialPorosity, initialSw, initialBo, initialBg]);

    const [nRealizations, setNRealizations] = useState(200);
    const [contactShift, setContactShift] = useState(0);

    // Helper: extract scalar Bo/Bg from store PVT curve or scalar
    const scalarBo = useMemo(() => {
        const pvt = appraisalData?.pvt;
        if (!pvt?.oilFVF) return undefined;
        if (typeof pvt.oilFVF === 'number') return pvt.oilFVF;
        if (Array.isArray((pvt.oilFVF as any).bo) && (pvt.oilFVF as any).bo.length > 0) {
            return (pvt.oilFVF as any).bo[(pvt.oilFVF as any).bo.length - 1];
        }
        return undefined;
    }, [appraisalData]);

    const scalarBg = useMemo(() => {
        const pvt = appraisalData?.pvt;
        if (!pvt?.gasFVF) return undefined;
        if (typeof pvt.gasFVF === 'number') return pvt.gasFVF;
        if (Array.isArray((pvt.gasFVF as any).bg) && (pvt.gasFVF as any).bg.length > 0) {
            return (pvt.gasFVF as any).bg[(pvt.gasFVF as any).bg.length - 1];
        }
        return undefined;
    }, [appraisalData]);

    // Merge store-derived scalars into params so compute functions receive plain numbers
    const resolvedParams = useMemo(() => ({
        grv: params.grv,
        ntg: params.ntg,
        porosity: params.porosity,
        sw: params.sw,
        bo: scalarBo ?? (typeof params.bo === 'number' ? params.bo : 1.25),
        bg: scalarBg ?? (typeof params.bg === 'number' ? params.bg : 0.0045),
        rfOil: params.rfOil,
        rfGas: params.rfGas,
        hasGasCap: params.hasGasCap,
        gasCapFraction: params.hasGasCap ? params.gasCapFraction : 0,
    }), [params, scalarBo, scalarBg]);

    const detVol = useMemo(() => computeDeterministicVolumes(resolvedParams), [resolvedParams]);
    const mc = useMemo(() => runMonteCarloVolumes(resolvedParams, nRealizations), [resolvedParams, nRealizations]);
    const tornado = useMemo(() => computeTornado(resolvedParams, detVol.stoipMMstb), [resolvedParams, detVol]);

    // ──────────────── Write results to Reserves layer ────────────────
    useEffect(() => {
        const stoipMMstb = detVol.stoipMMstb;
        const giipBscf = detVol.totalGiipBscf;
        const recOil = detVol.recoveryOilMMstb;
        const recGas = detVol.recoveryGasBscf;

        const prevStoip = reservesData?.deterministic?.stoiip;
        if (Math.abs((prevStoip ?? 0) - stoipMMstb) > 0.01) {
            updateReserves({
                deterministic: {
                    stoiip: stoipMMstb,
                    giip: giipBscf,
                    recoveryFactor: params.rfOil,
                    recoverableOil: recOil,
                    recoverableGas: recGas,
                },
                probabilistic: {
                    p10: mc.stoipDist.p10,
                    p50: mc.stoipDist.p50,
                    p90: mc.stoipDist.p90,
                    mean: mc.stoipDist.mean,
                    inputDistributions: [],
                },
            });
            updateConnection('appraisal→reserves', 'green');
        }
    }, [detVol, mc, params.rfOil, updateReserves, updateConnection, reservesData?.deterministic?.stoiip]);

    const handleParamsChange = useCallback((updates: Partial<typeof params>) => {
        setParams(prev => {
            const next = { ...prev, ...updates };
            if (updates.porosity !== undefined || updates.sw !== undefined || updates.bo !== undefined) {
                updateConnection('appraisal→reserves', 'yellow');
            }
            if (updates.grv !== undefined) {
                updateConnection('exploration→reserves', 'yellow');
            }
            return next;
        });
    }, [updateConnection]);

    const contactSensitivity = useMemo(() => {
        const shifts = [-100, -50, -25, 0, 25, 50, 100];
        return shifts.map(s => {
            const grvMod = resolvedParams.grv * (1 + s * 0.002);
            const v = computeDeterministicVolumes({ ...resolvedParams, grv: grvMod });
            return { shift: s, stoip: v.stoipMMstb, giip: v.totalGiipBscf };
        });
    }, [resolvedParams]);

    const histogramDataOil = useMemo(() => {
        const bins = 30;
        const data: { bin: number; freq: number }[] = [];
        const sorted = mc.stoipDist.realizations;
        if (sorted.length === 0) return data;
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const binW = (max - min) / bins || 1;
        for (let i = 0; i < bins; i++) {
            const lo = min + i * binW;
            const hi = lo + binW;
            data.push({ bin: lo + binW / 2, freq: sorted.filter(v => v >= lo && v < hi).length });
        }
        return data;
    }, [mc]);

    const phases = [
        { id: 'deterministic' as const, label: 'Deterministic', icon: Hash },
        { id: 'probabilistic' as const, label: 'Probabilistic', icon: PieChart },
        { id: 'tornado' as const, label: 'Sensitivity', icon: TrendingUp },
    ];

    const COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Box className="text-cyan-500" size={28} />
                        Volumetric Estimation — 3D Model
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Sub-Step 2.5.5 — STOIIP, GIIP, Probabilistic P10/P50/P90, Tornado</p>
                </div>
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                {[
                    { label: 'GRV (MRB)', key: 'grv', min: 100e6, max: 50000e6, step: 100e6, fmt: (v: number) => (v / 1e6).toFixed(0) + ' MRB' },
                    { label: 'NTG', key: 'ntg', min: 0.1, max: 1, step: 0.05, fmt: (v: number) => (v * 100).toFixed(0) + '%' },
                    { label: 'Porosity', key: 'porosity', min: 0.01, max: 0.40, step: 0.01, fmt: (v: number) => (v * 100).toFixed(1) + '%' },
                    { label: 'Sw', key: 'sw', min: 0.05, max: 0.95, step: 0.01, fmt: (v: number) => (v * 100).toFixed(1) + '%' },
                    { label: 'Bo (rb/stb)', key: 'bo', min: 0.8, max: 3, step: 0.05, fmt: (v: number) => v.toFixed(2) },
                    { label: 'Bg (rcf/scf)', key: 'bg', min: 0.001, max: 0.05, step: 0.0005, fmt: (v: number) => v.toFixed(4) },
                    { label: 'RF Oil', key: 'rfOil', min: 0.05, max: 0.65, step: 0.01, fmt: (v: number) => (v * 100).toFixed(0) + '%' },
                    { label: 'RF Gas', key: 'rfGas', min: 0.3, max: 0.95, step: 0.01, fmt: (v: number) => (v * 100).toFixed(0) + '%' },
                ].map(p => (
                    <div key={p.key}>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">{p.label}</label>
                        <input
                            type="number"
                            value={(params as any)[p.key]}
                            onChange={e => setParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                            step={p.step}
                        />
                        <span className="text-[11px] text-slate-600">{p.fmt((params as any)[p.key])}</span>
                    </div>
                ))}
                <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Gas Cap</label>
                    <button
                        onClick={() => setParams(p => ({ ...p, hasGasCap: !p.hasGasCap }))}
                        className={cn(
                            "w-full px-3 py-2 rounded-lg text-xs font-bold transition-all",
                            params.hasGasCap ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" : "bg-white/5 text-slate-500 border border-white/10"
                        )}
                    >
                        {params.hasGasCap ? 'Active' : 'Inactive'}
                    </button>
                </div>
            </div>

            {/* Phase Tabs */}
            <div className="flex gap-3 flex-wrap">
                {phases.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setPhase(p.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                            phase === p.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                    >
                        <p.icon size={14} /> {p.label}
                    </button>
                ))}
            </div>

            {/* DETERMINISTIC */}
            {phase === 'deterministic' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'STOIIP', value: detVol.stoipMMstb.toFixed(1), unit: 'MMstb', color: '#22c55e' },
                            { label: 'GIIP', value: detVol.totalGiipBscf.toFixed(1), unit: 'Bscf', color: '#f59e0b' },
                            { label: 'GRV', value: detVol.grvMmRB.toFixed(0), unit: 'MM RB', color: '#06b6d4' },
                            { label: 'HPV', value: detVol.hcpvMmRB.toFixed(1), unit: 'MM RB', color: '#8b5cf6' },
                            { label: 'Rec. Oil', value: detVol.recoveryOilMMstb.toFixed(1), unit: 'MMstb', color: '#10b981' },
                            { label: 'Rec. Gas', value: detVol.recoveryGasBscf.toFixed(1), unit: 'Bscf', color: '#ef4444' },
                        ].map(card => (
                            <div key={card.label} className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{card.label}</p>
                                <p className="text-2xl font-black text-white mt-1" style={{ color: card.color }}>{card.value}</p>
                                <p className="text-[11px] text-slate-600">{card.unit}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Contact Sensitivity (OWC/GOC Shift)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={contactSensitivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="shift" stroke="#ffffff40" tick={{ fontSize: 10 }} label={{ value: 'Contact Shift (ft)', position: 'bottom', fill: '#ffffff40' }} />
                                <YAxis yAxisId="left" stroke="#22c55e" tick={{ fontSize: 10 }} label={{ value: 'STOIIP (MMstb)', angle: -90, position: 'insideLeft', fill: '#22c55e' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} label={{ value: 'GIIP (Bscf)', angle: -90, position: 'insideRight', fill: '#f59e0b' }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="stoip" stroke="#22c55e" strokeWidth={2} name="STOIIP" />
                                <Line yAxisId="right" type="monotone" dataKey="giip" stroke="#f59e0b" strokeWidth={2} name="GIIP" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* PROBABILISTIC */}
            {phase === 'probabilistic' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Realizations:</span>
                        <input
                            type="number"
                            value={nRealizations}
                            onChange={e => setNRealizations(Math.max(10, Math.min(5000, parseInt(e.target.value) || 200)))}
                            className="w-24 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                        />
                        <span className="text-[11px] text-slate-600">(10–5000, Monte Carlo)</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {([
                            { label: 'STOIIP P10', val: mc.stoipDist.p10, unit: 'MMstb', color: '#ef4444' },
                            { label: 'STOIIP P50', val: mc.stoipDist.p50, unit: 'MMstb', color: '#f59e0b' },
                            { label: 'STOIIP P90', val: mc.stoipDist.p90, unit: 'MMstb', color: '#22c55e' },
                            { label: 'STOIIP Mean', val: mc.stoipDist.mean, unit: 'MMstb', color: '#06b6d4' },
                            { label: 'GIIP P10', val: mc.giipDist.p10, unit: 'Bscf', color: '#ef4444' },
                            { label: 'GIIP P50', val: mc.giipDist.p50, unit: 'Bscf', color: '#f59e0b' },
                            { label: 'GIIP P90', val: mc.giipDist.p90, unit: 'Bscf', color: '#22c55e' },
                            { label: 'GIIP Mean', val: mc.giipDist.mean, unit: 'Bscf', color: '#06b6d4' },
                            { label: 'Rec Oil P50', val: mc.recoverableOilDist.p50, unit: 'MMstb', color: '#10b981' },
                            { label: 'Rec Oil P90', val: mc.recoverableOilDist.p90, unit: 'MMstb', color: '#22c55e' },
                            { label: 'Rec Gas P50', val: mc.recoverableGasDist.p50, unit: 'Bscf', color: '#ef4444' },
                            { label: 'Rec Gas P90', val: mc.recoverableGasDist.p90, unit: 'Bscf', color: '#22c55e' },
                        ] as { label: string; val: number; unit: string; color: string }[]).map(card => (
                            <div key={card.label} className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 text-center">
                                <p className="text-[11px] text-slate-500 uppercase tracking-widest">{card.label}</p>
                                <p className="text-lg font-black text-white mt-1" style={{ color: card.color }}>{card.val.toFixed(1)}</p>
                                <p className="text-[11px] text-slate-600">{card.unit}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">STOIIP Distribution Histogram</h4>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={histogramDataOil}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="bin" stroke="#ffffff40" tick={{ fontSize: 10 }} label={{ value: 'STOIIP (MMstb)', position: 'bottom', fill: '#ffffff40' }} />
                                <YAxis stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                <Bar dataKey="freq" fill="#06b6d4" radius={[2, 2, 0, 0]}>
                                    {histogramDataOil.map((_, idx) => (
                                        <Cell key={idx} fill="#06b6d4" fillOpacity={0.7} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* TORNADO */}
            {phase === 'tornado' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Tornado Chart — STOIIP Sensitivity</h4>
                        <p className="text-slate-500 text-xs mb-4">Which parameter drives volumetric uncertainty most?</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={tornado.map(t => ({
                                name: t.param,
                                low: t.lowValue - detVol.stoipMMstb,
                                high: t.highValue - detVol.stoipMMstb,
                            }))} layout="vertical" barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 10 }} label={{ value: 'Δ STOIIP from Base (MMstb)', position: 'bottom', fill: '#ffffff40' }} />
                                <YAxis type="category" dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={(val: number) => [(val > 0 ? '+' : '') + val.toFixed(1) + ' MMstb']} />
                                <Legend />
                                <Bar dataKey="low" fill="#ef4444" name="Low Case" barSize={14} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="high" fill="#22c55e" name="High Case" barSize={14} radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {tornado.map((t, i) => (
                            <div key={t.param} className="bg-white/[0.02] p-3 rounded-xl border border-white/10 text-center">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{t.param}</p>
                                <p className="text-xs text-white">{(t.lowValue - detVol.stoipMMstb).toFixed(1)} to {(t.highValue - detVol.stoipMMstb).toFixed(1)} MMstb</p>
                                <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(Math.abs(t.highValue - t.lowValue) / (Math.abs(tornado[0].highValue - tornado[0].lowValue) || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}