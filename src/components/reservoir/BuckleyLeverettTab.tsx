/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { Waves, TrendingUp, Calculator, BarChart3, Download, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateCoreyRelPerm } from '../../lib/reservoir';
import {
    LineChart as RechartLine,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartTooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    AreaChart,
    Area,
    ComposedChart,
    Bar
} from 'recharts';

// --- Buckley-Leverett Engine ---

interface BLParams {
    swi: number;
    sor: number;
    kro_max: number;
    krw_max: number;
    no: number;  // Corey oil exponent
    nw: number;  // Corey water exponent
    mu_o: number;
    mu_w: number;
    phi: number;
    A: number;   // cross-sectional area (ft²)
    L: number;   // length (ft)
    qi: number;  // injection rate (bbl/day)
}

interface FractionalFlowPoint {
    sw: number;
    fw: number;
    dfw_dsw: number;
    kro: number;
    krw: number;
}

interface BLResult {
    fractionalFlowCurve: FractionalFlowPoint[];
    shockFrontSw: number;
    shockFrontFw: number;
    breakthroughPVI: number;
    saturationProfile: { x: number; sw: number }[];
    recoveryCurve: { pvi: number; rf: number; wor: number; fwOutlet: number }[];
    mobilityRatio: number;
}

function computeFractionalFlow(params: BLParams): FractionalFlowPoint[] {
    const { swi, sor, kro_max, krw_max, no, nw, mu_o, mu_w } = params;
    const points: FractionalFlowPoint[] = [];
    const nSteps = 200;
    const swMax = 1 - sor;
    const dSw = (swMax - swi) / (nSteps - 1);

    for (let i = 0; i < nSteps; i++) {
        const sw = swi + i * dSw;
        const { kro, krw } = calculateCoreyRelPerm(sw, swi, sor, kro_max, krw_max, no, nw);

        // Fractional flow: fw = 1 / (1 + (kro/krw)*(mu_w/mu_o))
        // For sw <= swi, fw = 0; for sw >= 1-sor, fw = 1
        let fw: number;
        if (krw <= 1e-12) {
            fw = 0;
        } else if (kro <= 1e-12) {
            fw = 1;
        } else {
            fw = 1.0 / (1.0 + (kro / krw) * (mu_w / mu_o));
        }

        // Derivative computed via finite difference (will be filled after)
        points.push({ sw, fw, dfw_dsw: 0, kro, krw });
    }

    // Compute dfw/dSw via central differences
    for (let i = 0; i < points.length; i++) {
        if (i === 0) {
            const df = points[i + 1].fw - points[i].fw;
            const ds = points[i + 1].sw - points[i].sw;
            points[i].dfw_dsw = ds > 0 ? df / ds : 0;
        } else if (i === points.length - 1) {
            const df = points[i].fw - points[i - 1].fw;
            const ds = points[i].sw - points[i - 1].sw;
            points[i].dfw_dsw = ds > 0 ? df / ds : 0;
        } else {
            points[i].dfw_dsw = (points[i + 1].fw - points[i - 1].fw) / (points[i + 1].sw - points[i - 1].sw);
        }
    }

    return points;
}

/**
 * Welge tangent construction:
 * Draw tangent from (swi, 0) to fw(Sw) curve. 
 * Tangent point is the shock front saturation.
 * The slope of the tangent = fw(Sw_f) / (Sw_f - swi) = dfw/dSw at Sw_f.
 */
function findShockFront(fwCurve: FractionalFlowPoint[], swi: number): { swf: number; fwf: number; slope: number } {
    // For each point beyond swi, compute the slope from (swi, 0) to (sw, fw)
    // The shock front is where this slope equals dfw_dsw (tangency condition)
    let bestMatch: { swf: number; fwf: number; slope: number; error: number } = { swf: swi + 0.1, fwf: 0, slope: 0, error: 1e99 };

    for (const pt of fwCurve) {
        if (pt.sw <= swi + 1e-8) continue;
        const secantSlope = pt.fw / (pt.sw - swi);
        const error = Math.abs(secantSlope - pt.dfw_dsw);

        if (error < bestMatch.error) {
            bestMatch = { swf: pt.sw, fwf: pt.fw, slope: pt.dfw_dsw, error };
        }
    }

    return { swf: bestMatch.swf, fwf: bestMatch.fwf, slope: bestMatch.slope };
}

function computeBLResults(params: BLParams): BLResult {
    const fwCurve = computeFractionalFlow(params);
    const { swi, sor, phi, A, L, qi } = params;

    const { swf, fwf, slope } = findShockFront(fwCurve, swi);

    // Breakthrough PVI = 1 / (dfw_dsw at shock front) = 1 / slope
    const breakthroughPVI = slope > 0 ? 1.0 / slope : 999;

    // Compute end-point mobility ratio: M = (krw_max/mu_w) / (kro_max/mu_o)
    const mobilityRatio = (params.krw_max / params.mu_w) / (params.kro_max / params.mu_o);

    const poreVolume = phi * A * L * 5.6146; // ft³ to bbl (1 bbl = 5.6146 ft³)

    // --- Saturation profile at breakthrough ---
    // x(Sw) = (qi * t / (phi * A)) * (dfw/dSw)
    // At breakthrough, t_bt = poreVolume / qi
    // x(Sw) = L * (dfw/dSw) / (dfw/dSw)_f  => dimensionless = (dfw/dSw) / slope
    const saturationProfile: { x: number; sw: number }[] = [];

    for (const pt of fwCurve) {
        if (pt.sw < swf) continue; // behind shock front = shock saturation
        const xFraction = pt.dfw_dsw / slope; // fraction of L
        if (xFraction >= 0 && xFraction <= 1.0) {
            saturationProfile.push({ x: xFraction * L, sw: pt.sw });
        }
    }
    // Add shock front point
    saturationProfile.unshift({ x: L, sw: swf }); // front at x = L at breakthrough
    saturationProfile.push({ x: 0, sw: 1 - sor }); // inlet at residual oil

    // Sort by x descending (inlet to outlet)
    saturationProfile.sort((a, b) => b.x - a.x);

    // --- Recovery curve (after breakthrough) ---
    // pvi > pvi_bt: outlet saturation > swf
    // Use Welge equation: RF = (Sw_avg - swi) / (1 - swi)
    // where Sw_avg = outlet_sw + (1 - fw_outlet) / (dfw/dSw)_outlet  ... Welge's equation
    const recoveryCurve: { pvi: number; rf: number; wor: number; fwOutlet: number }[] = [];

    // Pre-breakthrough points
    const pviSteps = 40;
    for (let i = 1; i <= pviSteps; i++) {
        const pvi = (i / pviSteps) * breakthroughPVI;
        const rf = pvi; // Pre-breakthrough: all injected water stays in, RF = PVI
        recoveryCurve.push({ pvi, rf, wor: 0, fwOutlet: 0 });
    }

    // Post-breakthrough
    const postBtSteps = 40;
    const maxPVI = breakthroughPVI * 5;
    const postBtDelta = (maxPVI - breakthroughPVI) / postBtSteps;

    for (let i = 1; i <= postBtSteps; i++) {
        const pvi = breakthroughPVI + i * postBtDelta;

        // At outlet: dfw/dSw = 1/pvi
        const targetDeriv = 1.0 / pvi;

        // Find outlet saturation from derivative
        let outletSw = swf;
        let outletFw = fwf;
        for (const pt of fwCurve) {
            if (pt.sw >= swf && pt.dfw_dsw <= targetDeriv + 0.01) {
                outletSw = pt.sw;
                outletFw = pt.fw;
                break;
            }
        }
        // If none found, use the last point
        if (outletSw <= swf + 1e-6) {
            const last = fwCurve[fwCurve.length - 1];
            outletSw = last.sw;
            outletFw = last.fw;
        }

        // Welge: Sw_avg = Sw_outlet + (1 - fw_outlet) * pvi
        const swAvg = outletSw + (1 - outletFw) / targetDeriv;
        const rf = (swAvg - swi) / (1 - swi);
        const wor = outletFw > 0.999 ? 99 : outletFw / (1 - outletFw);

        recoveryCurve.push({ pvi, rf: Math.min(rf, 1 - sor - 0.001), wor: Math.min(wor, 100), fwOutlet: outletFw });
    }

    return {
        fractionalFlowCurve: fwCurve,
        shockFrontSw: swf,
        shockFrontFw: fwf,
        breakthroughPVI,
        saturationProfile,
        recoveryCurve,
        mobilityRatio
    };
}

// --- Constants ---

const DEFAULT_PARAMS: BLParams = {
    swi: 0.22,
    sor: 0.28,
    kro_max: 0.85,
    krw_max: 0.35,
    no: 2.5,
    nw: 3.0,
    mu_o: 4.5,
    mu_w: 0.6,
    phi: 0.20,
    A: 50000,  // ft²
    L: 1000,   // ft
    qi: 500    // bbl/day
};

// --- Component ---

export function BuckleyLeverettTab() {
    const [params, setParams] = useState<BLParams>(DEFAULT_PARAMS);
    const [showHelp, setShowHelp] = useState(false);

    const results = useMemo(() => computeBLResults(params), [params]);

    const saturationLineChart = useMemo(() => {
        return results.saturationProfile.map(p => ({
            x: Math.round(p.x),
            sw: Number(p.sw.toFixed(4))
        }));
    }, [results]);

    const fractionalFlowChart = useMemo(() => {
        return results.fractionalFlowCurve
            .filter((_, i) => i % 4 === 0) // subsample for perf
            .map(p => ({
                sw: Number(p.sw.toFixed(4)),
                fw: Number(p.fw.toFixed(4)),
                dfw: Number(p.dfw_dsw.toFixed(4))
            }));
    }, [results]);

    const recoveryChart = useMemo(() => {
        return results.recoveryCurve.filter((_, i) => i % 2 === 0).map(r => ({
            pvi: Number(r.pvi.toFixed(2)),
            rf: Number((r.rf * 100).toFixed(2)),
            wor: Number(r.wor.toFixed(2)),
            fw: Number(r.fwOutlet.toFixed(3))
        }));
    }, [results]);

    const handleExport = () => {
        const csvRows = ['Sw,fw,dfw_dSw,kro,krw'];
        results.fractionalFlowCurve.forEach(p => {
            csvRows.push(`${p.sw.toFixed(4)},${p.fw.toFixed(6)},${p.dfw_dsw.toFixed(6)},${p.kro.toFixed(6)},${p.krw.toFixed(6)}`);
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buckley_leverett_curve.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const InputField = ({ label, value, onChange, min, max, step, unit }: {
        label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit?: string;
    }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label} {unit && <span className="text-slate-600">({unit})</span>}</label>
            <input
                type="number"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                step={step}
                min={min}
                max={max}
                className="w-full px-3 py-1.5 bg-slate-900/70 border border-slate-700/50 rounded-lg text-xs text-white font-mono focus:border-cyan-500/50 focus:outline-none transition-colors"
            />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                        <Waves size={16} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Buckley-Leverett Displacement</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">1D Immiscible Frontal Advance · Welge Tangent · Recovery Prediction</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 border border-slate-700/50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <Info size={12} /> Theory
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 border border-slate-700/50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <Download size={12} /> Export
                    </button>
                </div>
            </div>

            {/* Theory Panel */}
            {showHelp && (
                <div className="p-5 bg-slate-900/60 border border-slate-700/30 rounded-xl space-y-3 text-xs text-slate-400 leading-relaxed">
                    <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Buckley-Leverett Theory (1942)</h4>
                    <p>
                        The Buckley-Leverett equation describes one-dimensional, immiscible displacement of oil by water in a porous medium.
                        It assumes incompressible fluids, homogeneous rock, and capillary pressure is negligible compared to viscous forces.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1.5">
                            <p className="text-white font-mono text-[11px]">Fractional Flow:</p>
                            <p className="bg-slate-950/80 p-2 rounded font-mono text-[10px] text-cyan-300">
                                fw = 1 / (1 + (kro/krw) · (μw/μo))
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-white font-mono text-[11px]">Frontal Advance:</p>
                            <p className="bg-slate-950/80 p-2 rounded font-mono text-[10px] text-cyan-300">
                                (dx/dt)_Sw = (qi / ΦA) · (∂fw/∂Sw)
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-white font-mono text-[11px]">Welge Tangent:</p>
                            <p className="bg-slate-950/80 p-2 rounded font-mono text-[10px] text-cyan-300">
                                Slope = fw(Sw_f) / (Sw_f - Swi) = dfw/dSw at shock
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-white font-mono text-[11px]">Breakthrough PVI:</p>
                            <p className="bg-slate-950/80 p-2 rounded font-mono text-[10px] text-cyan-300">
                                PVI_bt = 1 / (dfw/dSw)_f
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-slate-900/40 border border-slate-700/20 rounded-xl">
                <InputField label="Swi" value={params.swi} onChange={v => setParams({ ...params, swi: v })} min={0.05} max={0.5} step={0.01} />
                <InputField label="Sor" value={params.sor} onChange={v => setParams({ ...params, sor: v })} min={0.05} max={0.5} step={0.01} />
                <InputField label="kro,max" value={params.kro_max} onChange={v => setParams({ ...params, kro_max: v })} min={0.3} max={1.0} step={0.01} />
                <InputField label="krw,max" value={params.krw_max} onChange={v => setParams({ ...params, krw_max: v })} min={0.05} max={0.8} step={0.01} />
                <InputField label="Corey no" value={params.no} onChange={v => setParams({ ...params, no: v })} min={1} max={6} step={0.1} />
                <InputField label="Corey nw" value={params.nw} onChange={v => setParams({ ...params, nw: v })} min={1} max={6} step={0.1} />
                <InputField label="μo" value={params.mu_o} onChange={v => setParams({ ...params, mu_o: v })} min={0.1} max={100} step={0.1} unit="cP" />
                <InputField label="μw" value={params.mu_w} onChange={v => setParams({ ...params, mu_w: v })} min={0.1} max={10} step={0.1} unit="cP" />
                <InputField label="Porosity" value={params.phi} onChange={v => setParams({ ...params, phi: v })} min={0.05} max={0.4} step={0.01} />
                <InputField label="Area" value={params.A} onChange={v => setParams({ ...params, A: v })} min={100} max={500000} step={100} unit="ft²" />
                <InputField label="Length" value={params.L} onChange={v => setParams({ ...params, L: v })} min={10} max={10000} step={10} unit="ft" />
                <InputField label="qi" value={params.qi} onChange={v => setParams({ ...params, qi: v })} min={1} max={50000} step={10} unit="bbl/d" />
            </div>

            {/* Key Results Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/30 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Shock Front Sw</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono">{results.shockFrontSw.toFixed(4)}</div>
                    <div className="text-[11px] text-slate-600 mt-1">fw = {results.shockFrontFw.toFixed(4)}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/30 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Breakthrough PVI</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">{results.breakthroughPVI.toFixed(3)}</div>
                    <div className="text-[11px] text-slate-600 mt-1">Pore volumes injected</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/30 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobility Ratio (M)</div>
                    <div className="text-xl font-bold text-amber-400 font-mono">{results.mobilityRatio.toFixed(3)}</div>
                    <div className="text-[11px] text-slate-600 mt-1">{results.mobilityRatio < 1 ? 'Favorable (M < 1)' : 'Unfavorable (M > 1)'}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/30 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pore Volume</div>
                    <div className="text-xl font-bold text-purple-400 font-mono">{((params.phi * params.A * params.L * 5.6146) / 1e6).toFixed(2)}</div>
                    <div className="text-[11px] text-slate-600 mt-1">MM bbl</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fractional Flow Curve */}
                <div className="p-5 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic">Fractional Flow & Derivative</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={fractionalFlowChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="sw" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Water Saturation (Sw)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'fw', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }} domain={[0, 1]} />
                            <YAxis yAxisId="right" orientation="right" stroke="#a78bfa" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'dfw/dSw', angle: 90, position: 'insideRight', fill: '#a78bfa', fontSize: 10 }} />
                            <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                            <Line yAxisId="left" type="monotone" dataKey="fw" stroke="#06b6d4" strokeWidth={2} dot={false} name="fw (Fractional Flow)" />
                            <Line yAxisId="right" type="monotone" dataKey="dfw" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="dfw/dSw" />
                            {/* Tangent line from (swi, 0) to (swf, fwf) */}
                            <ReferenceLine
                                yAxisId="left"
                                segment={[
                                    { x: params.swi, y: 0 },
                                    { x: results.shockFrontSw, y: results.shockFrontFw }
                                ]}
                                stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3"
                                label="Welge Tangent"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Saturation Profile at Breakthrough */}
                <div className="p-5 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic">Saturation Profile @ Breakthrough</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={saturationLineChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="x" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Distance from Injector (ft)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} reversed />
                            <YAxis stroke="#06b6d4" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[params.swi * 0.8, 1 - params.sor * 0.5]} label={{ value: 'Sw', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }} />
                            <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                            <Area type="stepAfter" dataKey="sw" stroke="#06b6d4" strokeWidth={2} fill="url(#swGradient)" name="Sw" />
                            <defs>
                                <linearGradient id="swGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <ReferenceLine y={results.shockFrontSw} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: `Swf = ${results.shockFrontSw.toFixed(3)}`, position: 'right', fill: '#f59e0b', fontSize: 10 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recovery Curve */}
                <div className="p-5 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic">Recovery & WOR vs. PVI</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={recoveryChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="pvi" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Pore Volumes Injected', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis yAxisId="rf" stroke="#10b981" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[0, 100]} label={{ value: 'RF (%)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
                            <YAxis yAxisId="wor" orientation="right" stroke="#f97316" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[0, 'auto']} label={{ value: 'WOR', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10 }} />
                            <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                            <Area yAxisId="rf" type="monotone" dataKey="rf" stroke="#10b981" strokeWidth={2} fill="url(#rfGradient)" name="Recovery Factor (%)" />
                            <Bar yAxisId="wor" dataKey="wor" fill="#f97316" opacity={0.6} name="WOR" barSize={4} />
                            <defs>
                                <linearGradient id="rfGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <ReferenceLine x={results.breakthroughPVI} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" label={{ value: `BT PVI=${results.breakthroughPVI.toFixed(2)}`, position: 'top', fill: '#ef4444', fontSize: 9 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Rel Perm & Mobility */}
                <div className="p-5 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic">Relative Permeabilities (Corey)</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={fractionalFlowChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="sw" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Water Saturation (Sw)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[0, 1]} label={{ value: 'Relative Perm', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                            <Line type="monotone" dataKey="kro" stroke="#ef4444" strokeWidth={2} dot={false} name="kro" />
                            <Line type="monotone" dataKey="krw" stroke="#3b82f6" strokeWidth={2} dot={false} name="krw" />
                            <ReferenceLine x={results.shockFrontSw} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: `Swf`, position: 'top', fill: '#f59e0b', fontSize: 9 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reference */}
            <div className="p-3 bg-slate-900/30 border border-slate-700/20 rounded-lg flex items-center gap-2 text-[11px] text-slate-600 italic">
                <Info size={10} />
                Buckley, S.E. and Leverett, M.C. (1942). "Mechanism of Fluid Displacement in Sands." Transactions of the AIME, 146(01), 107-116. | Welge, H.J. (1952). "A Simplified Method for Computing Oil Recovery by Gas or Water Drive." Journal of Petroleum Technology, 4(04), 91-98.
            </div>
        </div>
    );
}

export default BuckleyLeverettTab;