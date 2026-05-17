import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ScatterChart, Scatter, ZAxis, ComposedChart, Area, Cell
} from 'recharts';
import {
    octaneBlendingNonlinear, rvpBlending,
    gasolineBlendCost
} from '../../lib/refining';

// ───────────────────────────────────────────────────────────────
// Non-linear Octane Blending Model with Interaction Coefficients
// ───────────────────────────────────────────────────────────────

export interface BlendComponent {
    id: string;
    name: string;
    volBpd: number;
    ron: number;
    mon: number;
    rvp: number;
    olefinVolPct: number;
    aromaticVolPct: number;
    benzeneVolPct: number;
    sulfurPpm: number;
    costPerBbl: number;
    molecularWeight?: number;
    locked?: boolean;
}

export interface BlendTarget {
    aki: number;
    ron: number;
    mon: number;
    maxRvpPsycho: number;
    maxBenzeneVolPct: number;
    maxSulfurPpm: number;
    maxOlefinVolPct: number;
    maxAromaticVolPct: number;
    gradeName: string;
}

interface GasolineBlendOptimizerProps {
    components: BlendComponent[];
    target: BlendTarget;
    totalDesiredBpd: number;
}

export const GasolineBlendOptimizer: React.FC<GasolineBlendOptimizerProps> = ({
    components: initialComponents,
    target,
    totalDesiredBpd
}) => {
    const [components, setComponents] = useState<BlendComponent[]>(initialComponents);
    const [optimizing, setOptimizing] = useState(false);

    // ─── Auto-optimize volumes to meet target ───
    const optimizeVolumes = useCallback((comps: BlendComponent[]): BlendComponent[] => {
        const locked = comps.filter(c => c.locked);
        const unlocked = comps.filter(c => !c.locked);
        const lockedVol = locked.reduce((s, c) => s + c.volBpd, 0);
        const remainingVol = Math.max(0, totalDesiredBpd - lockedVol);

        if (unlocked.length === 0 || remainingVol <= 0) return comps;

        // Equal initial distribution for remaining volume
        const equalShare = remainingVol / unlocked.length;

        // Iterative optimization (simplified NLP gradient approach)
        let working = unlocked.map(c => ({ ...c, volBpd: equalShare }));
        const bestComps = [...locked, ...working];

        // Simple heuristic: shift volume to higher-octane, lower-cost components
        for (let iteration = 0; iteration < 10; iteration++) {
            const totalVol = bestComps.reduce((s, c) => s + c.volBpd, 0);
            if (totalVol <= 0) break;

            const octaneResult = octaneBlendingNonlinear(
                bestComps.map(c => ({
                    volBpd: c.volBpd,
                    ron: c.ron,
                    mon: c.mon,
                    olefinPct: c.olefinVolPct,
                    aromaticPct: c.aromaticVolPct,
                    sulfurPpm: c.sulfurPpm
                }))
            );

            // If octane is too low, shift from low-RON to high-RON
            if (octaneResult.aki < target.aki - 0.1) {
                const avgRon = bestComps.reduce((s, c) => s + c.ron * c.volBpd, 0) / totalVol;
                bestComps.forEach(c => {
                    if (!c.locked) {
                        const deltaRon = c.ron - avgRon;
                        c.volBpd = Math.max(0, c.volBpd + deltaRon * 200);
                    }
                });
            }

            // Normalize to target volume
            const newTotal = bestComps.reduce((s, c) => s + c.volBpd, 0);
            if (newTotal > 0) {
                bestComps.forEach(c => {
                    if (!c.locked) c.volBpd = c.volBpd * totalDesiredBpd / newTotal;
                });
            }
        }

        return bestComps;
    }, [totalDesiredBpd, target.aki]);

    // ─── Run optimization ───
    const handleOptimize = useCallback(() => {
        setOptimizing(true);
        setTimeout(() => {
            setComponents(prev => optimizeVolumes(prev));
            setOptimizing(false);
        }, 300);
    }, [optimizeVolumes]);

    // ─── Update component volume ───
    const updateVolume = useCallback((id: string, volBpd: number) => {
        setComponents(prev => prev.map(c =>
            c.id === id ? { ...c, volBpd: Math.max(0, volBpd) } : c
        ));
    }, []);

    const toggleLock = useCallback((id: string) => {
        setComponents(prev => prev.map(c =>
            c.id === id ? { ...c, locked: !c.locked } : c
        ));
    }, []);

    // ─── Calculated blend properties ───
    const blendResults = useMemo(() => {
        const active = components.filter(c => c.volBpd > 0);
        if (active.length === 0) return null;

        const totalVol = active.reduce((s, c) => s + c.volBpd, 0);
        const ronResult = octaneBlendingNonlinear(active.map(c => ({
            volBpd: c.volBpd,
            ron: c.ron,
            mon: c.mon,
            olefinPct: c.olefinVolPct,
            aromaticPct: c.aromaticVolPct,
            sulfurPpm: c.sulfurPpm,
        })));

        const rvpResult = rvpBlending(active.map(c => ({
            volBpd: c.volBpd,
            rvpPsi: c.rvp,
            molecularWeight: c.molecularWeight
        })));

        const blendSulfur = active.reduce((s, c) => s + c.volBpd * c.sulfurPpm, 0) / Math.max(1, totalVol);
        const blendBenzene = active.reduce((s, c) => s + c.volBpd * c.benzeneVolPct, 0) / Math.max(1, totalVol);
        const blendOlefin = active.reduce((s, c) => s + c.volBpd * c.olefinVolPct, 0) / Math.max(1, totalVol);
        const blendAromatic = active.reduce((s, c) => s + c.volBpd * c.aromaticVolPct, 0) / Math.max(1, totalVol);
        const totalCost = active.reduce((s, c) => s + c.volBpd * c.costPerBbl, 0);

        const volumeReqMet = totalVol >= totalDesiredBpd * 0.98;

        return {
            totalVol,
            ronResult,
            rvpResult,
            blendSulfur,
            blendBenzene,
            blendOlefin,
            blendAromatic,
            totalCostPerDay: totalCost,
            costPerBblBlend: totalCost / Math.max(1, totalVol),
            volumeReqMet,
            akiCompliant: ronResult.aki >= target.aki,
            rvpCompliant: rvpResult.compliant,
            sulfurCompliant: blendSulfur <= target.maxSulfurPpm,
            benzeneCompliant: blendBenzene <= target.maxBenzeneVolPct,
            olefinCompliant: blendOlefin <= target.maxOlefinVolPct,
            aromaticCompliant: blendAromatic <= target.maxAromaticVolPct,
            allCompliant: (
                ronResult.aki >= target.aki &&
                rvpResult.compliant &&
                blendSulfur <= target.maxSulfurPpm &&
                blendBenzene <= target.maxBenzeneVolPct &&
                blendOlefin <= target.maxOlefinVolPct &&
                blendAromatic <= target.maxAromaticVolPct &&
                volumeReqMet
            ),
        };
    }, [components, target, totalDesiredBpd]);

    // ─── Octane response surface (RON vs component fractions) ───
    const octaneSurface = useMemo(() => {
        if (components.length < 2) return [];
        const points: { x: number; y: number; z: number }[] = [];
        const [c1, c2] = components;
        const others = components.slice(2);
        const othersVol = others.reduce((s, c) => s + c.volBpd, 0);

        for (let f1 = 0.1; f1 <= 0.9; f1 += 0.1) {
            for (let f2 = 0.1; f2 <= 0.9 - f1; f2 += 0.1) {
                const totalTest = totalDesiredBpd;
                const v1 = f1 * totalTest;
                const v2 = f2 * totalTest;
                const vOthers = Math.max(0, totalTest - v1 - v2);
                const r = octaneBlendingNonlinear([
                    { volBpd: v1, ron: c1.ron, mon: c1.mon, olefinPct: c1.olefinVolPct, aromaticPct: c1.aromaticVolPct, sulfurPpm: c1.sulfurPpm },
                    { volBpd: v2, ron: c2.ron, mon: c2.mon, olefinPct: c2.olefinVolPct, aromaticPct: c2.aromaticVolPct, sulfurPpm: c2.sulfurPpm },
                    ...others.map(c => ({ volBpd: vOthers / Math.max(1, others.length), ron: c.ron, mon: c.mon, olefinPct: c.olefinVolPct, aromaticPct: c.aromaticVolPct, sulfurPpm: c.sulfurPpm })),
                ]);
                points.push({ x: f1 * 100, y: f2 * 100, z: r.aki });
            }
        }
        return points;
    }, [components, totalDesiredBpd]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-cyan-400">Gasoline Blend Optimizer — {target.gradeName}</h3>
                    <button
                        onClick={handleOptimize}
                        disabled={optimizing}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${optimizing
                            ? 'bg-gray-600 text-gray-400'
                            : 'bg-cyan-600 text-white hover:bg-cyan-500'
                            }`}
                    >
                        {optimizing ? 'Optimizing...' : 'Auto-Optimize'}
                    </button>
                </div>
            </div>

            {/* Component inputs */}
            <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-bold text-gray-300 mb-2">Blend Components</h4>
                <div className="grid grid-cols-1 gap-2">
                    {components.map(comp => (
                        <div key={comp.id} className="flex items-center gap-2 bg-gray-750 rounded p-2">
                            <button
                                onClick={() => toggleLock(comp.id)}
                                className={`w-5 h-5 rounded text-[10px] font-bold flex-shrink-0 ${comp.locked ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300'
                                    }`}
                                title={comp.locked ? 'Locked' : 'Auto'}
                            >
                                {comp.locked ? '🔒' : '🔓'}
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-gray-200 truncate">{comp.name}</div>
                                <div className="text-[11px] text-gray-500">
                                    RON:{comp.ron.toFixed(0)} MON:{comp.mon.toFixed(0)} RVP:{comp.rvp.toFixed(1)} ${comp.costPerBbl.toFixed(0)}/bbl
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={comp.volBpd}
                                    onChange={e => updateVolume(comp.id, Number(e.target.value))}
                                    className="w-20 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                                    step={100}
                                    min={0}
                                />
                                <span className="text-[11px] text-gray-500">BPD</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-gray-500">
                        Total: {components.reduce((s, c) => s + c.volBpd, 0).toLocaleString()} / {totalDesiredBpd.toLocaleString()} BPD
                    </span>
                    <span className={`${(components.reduce((s, c) => s + c.volBpd, 0) >= totalDesiredBpd * 0.98) ? 'text-green-400' : 'text-yellow-400'}`}>
                        {(components.reduce((s, c) => s + c.volBpd, 0) / Math.max(1, totalDesiredBpd) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Blend Results */}
            {blendResults && (
                <div className="bg-gray-900 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-gray-300 mb-2">Blend Properties</h4>

                    {/* Compliance grid */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        <SpecBadge
                            label="AKI"
                            actual={blendResults.ronResult.aki.toFixed(1)}
                            target={target.aki.toString()}
                            compliant={blendResults.akiCompliant}
                        />
                        <SpecBadge
                            label="RVP"
                            actual={blendResults.rvpResult.blendRVPPsi.toFixed(1)}
                            target={`≤${target.maxRvpPsycho}`}
                            compliant={blendResults.rvpCompliant}
                        />
                        <SpecBadge
                            label="Sulfur"
                            actual={blendResults.blendSulfur.toFixed(0)}
                            target={`≤${target.maxSulfurPpm}`}
                            compliant={blendResults.sulfurCompliant}
                            unit="ppm"
                        />
                        <SpecBadge
                            label="Benzene"
                            actual={blendResults.blendBenzene.toFixed(2)}
                            target={`≤${target.maxBenzeneVolPct}`}
                            compliant={blendResults.benzeneCompliant}
                            unit="vol%"
                        />
                        <SpecBadge
                            label="Olefins"
                            actual={blendResults.blendOlefin.toFixed(1)}
                            target={`≤${target.maxOlefinVolPct}`}
                            compliant={blendResults.olefinCompliant}
                            unit="vol%"
                        />
                        <SpecBadge
                            label="Aromatics"
                            actual={blendResults.blendAromatic.toFixed(1)}
                            target={`≤${target.maxAromaticVolPct}`}
                            compliant={blendResults.aromaticCompliant}
                            unit="vol%"
                        />
                        <SpecBadge
                            label="Volume"
                            actual={blendResults.totalVol.toLocaleString()}
                            target={`≥${(totalDesiredBpd * 0.98).toLocaleString()}`}
                            compliant={blendResults.volumeReqMet}
                            unit="BPD"
                        />
                        <div className={`rounded p-2 text-center ${blendResults.allCompliant ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
                            <div className="text-[10px] text-gray-400">OVERALL</div>
                            <div className={`text-xs font-bold ${blendResults.allCompliant ? 'text-green-400' : 'text-red-400'}`}>
                                {blendResults.allCompliant ? '✓ PASS' : '✗ FAIL'}
                            </div>
                        </div>
                    </div>

                    {/* Cost */}
                    <div className="flex justify-between text-xs bg-gray-800 rounded p-2">
                        <span className="text-gray-400">Blend Cost:</span>
                        <span className="text-emerald-400 font-bold">${blendResults.costPerBblBlend.toFixed(2)}/bbl</span>
                        <span className="text-gray-400">Daily: ${(blendResults.totalCostPerDay / 1000).toFixed(0)}k</span>
                    </div>
                </div>
            )}

            {/* Octane Response Surface */}
            {octaneSurface.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-yellow-400 mb-2">
                        Octane Response Surface — {components[0]?.name || 'C1'} vs {components[1]?.name || 'C2'}
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="x"
                                stroke="#9ca3af"
                                tick={{ fontSize: 9 }}
                                label={{ value: `${components[0]?.name || 'C1'} %`, position: 'bottom', style: { fill: '#9ca3af', fontSize: 10 } }}
                            />
                            <YAxis
                                dataKey="y"
                                stroke="#9ca3af"
                                tick={{ fontSize: 9 }}
                                label={{ value: `${components[1]?.name || 'C2'} %`, angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }}
                            />
                            <ZAxis dataKey="z" range={[20, 200]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                                formatter={(value: number, name: string) => [name === 'z' ? `AKI: ${value.toFixed(1)}` : `${value.toFixed(1)}%`]}
                            />
                            <Scatter
                                data={octaneSurface}
                                fill="#06b6d4"
                                opacity={0.7}
                            >
                                {octaneSurface.map((entry, idx) => {
                                    const hue = 200 + (entry.z - 85) * 15;
                                    return (
                                        <Cell
                                            key={idx}
                                            fill={`hsl(${Math.min(260, Math.max(200, hue))}, 80%, ${50 + (entry.z - target.aki) * 5}%)`}
                                        />
                                    );
                                })}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-3 mt-1 text-[11px]">
                        <span className="text-blue-400">■ Low Octane</span>
                        <span className="text-purple-400">■ Target AKI {target.aki}</span>
                        <span className="text-pink-400">■ High Octane</span>
                    </div>
                </div>
            )}

            {/* Component share pie */}
            {blendResults && (
                <div className="bg-gray-900 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-gray-300 mb-2">Component Blend Shares</h4>
                    <div className="flex items-end gap-1 h-16">
                        {components.filter(c => c.volBpd > 0).map((comp, idx) => {
                            const pct = (comp.volBpd / Math.max(1, blendResults.totalVol)) * 100;
                            const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#ef4444', '#f97316'];
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <span className="text-[10px] text-gray-500">{pct.toFixed(1)}%</span>
                                    <div
                                        className="w-full rounded-t transition-all duration-500"
                                        style={{
                                            height: `${pct}%`,
                                            backgroundColor: colors[idx % colors.length],
                                        }}
                                    />
                                    <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">{comp.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Non-linear blending note */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-2">
                <div className="text-[10px] text-yellow-400">
                    <span className="font-bold">⚡ Non-Linear Blending:</span> Octane and RVP blending are non-linear.
                    Interaction effects mean blend octane ≠ volumetric average. The optimizer uses blending indices and
                    interaction coefficients based on published API/industry correlations. RON give-away above spec costs
                    ~$0.08 per 0.1 octane per barrel.
                </div>
            </div>
        </div>
    );
};

// ─── Spec Badge Component ───
const SpecBadge: React.FC<{
    label: string;
    actual: string;
    target: string;
    compliant: boolean;
    unit?: string;
}> = ({ label, actual, target, compliant, unit }) => (
    <div className={`rounded p-2 text-center ${compliant ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'
        }`}>
        <div className="text-[10px] text-gray-400">{label}</div>
        <div className={`text-xs font-bold ${compliant ? 'text-green-400' : 'text-red-400'}`}>
            {actual}{unit ? ` ${unit}` : ''}
        </div>
        <div className="text-[10px] text-gray-500">Target: {target}{unit ? ` ${unit}` : ''}</div>
    </div>
);

// ───────────────────────────────────────────────────────────────
// Multi-Grade Gasoline Blending Dashboard
// ───────────────────────────────────────────────────────────────

interface MultiGradeBlendProps {
    regularBlend: {
        blendRon: number;
        blendMon: number;
        aki: number;
        compliant: boolean;
        costPerBbl: number;
    };
    midBlend: {
        blendRon: number;
        blendMon: number;
        aki: number;
        compliant: boolean;
        costPerBbl: number;
    };
    premiumBlend: {
        blendRon: number;
        blendMon: number;
        aki: number;
        compliant: boolean;
        costPerBbl: number;
    };
    totalRegularBpd: number;
    totalMidBpd: number;
    totalPremiumBpd: number;
}

export const MultiGradeBlendDashboard: React.FC<MultiGradeBlendProps> = ({
    regularBlend, midBlend, premiumBlend,
    totalRegularBpd, totalMidBpd, totalPremiumBpd
}) => {
    const totalAll = totalRegularBpd + totalMidBpd + totalPremiumBpd;
    const totalCost = regularBlend.costPerBbl * totalRegularBpd +
        midBlend.costPerBbl * totalMidBpd +
        premiumBlend.costPerBbl * totalPremiumBpd;
    const avgCost = totalCost / Math.max(1, totalAll);

    return (
        <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-bold text-cyan-400 text-center mb-3">Multi-Grade Blending Dashboard</h3>

            {/* Grade cards */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <GradeCard
                    grade="Regular"
                    targetAki={87}
                    aki={regularBlend.aki}
                    ron={regularBlend.blendRon}
                    mon={regularBlend.blendMon}
                    costPerBbl={regularBlend.costPerBbl}
                    bpd={totalRegularBpd}
                    compliant={regularBlend.compliant}
                    color="#3b82f6"
                />
                <GradeCard
                    grade="Mid-Grade"
                    targetAki={89}
                    aki={midBlend.aki}
                    ron={midBlend.blendRon}
                    mon={midBlend.blendMon}
                    costPerBbl={midBlend.costPerBbl}
                    bpd={totalMidBpd}
                    compliant={midBlend.compliant}
                    color="#8b5cf6"
                />
                <GradeCard
                    grade="Premium"
                    targetAki={91}
                    aki={premiumBlend.aki}
                    ron={premiumBlend.blendRon}
                    mon={premiumBlend.blendMon}
                    costPerBbl={premiumBlend.costPerBbl}
                    bpd={totalPremiumBpd}
                    compliant={premiumBlend.compliant}
                    color="#f59e0b"
                />
            </div>

            {/* Volume distribution */}
            <div className="bg-gray-800 rounded p-3">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Volume Distribution</span>
                    <span className="text-emerald-400">Avg Cost: ${avgCost.toFixed(2)}/bbl</span>
                </div>
                <div className="flex h-6 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-500 flex items-center justify-center transition-all duration-500"
                        style={{ width: `${(totalRegularBpd / Math.max(1, totalAll)) * 100}%` }}
                    >
                        <span className="text-[10px] font-bold text-white">
                            {((totalRegularBpd / Math.max(1, totalAll)) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div
                        className="bg-purple-500 flex items-center justify-center transition-all duration-500"
                        style={{ width: `${(totalMidBpd / Math.max(1, totalAll)) * 100}%` }}
                    >
                        <span className="text-[10px] font-bold text-white">
                            {((totalMidBpd / Math.max(1, totalAll)) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div
                        className="bg-yellow-500 flex items-center justify-center transition-all duration-500"
                        style={{ width: `${(totalPremiumBpd / Math.max(1, totalAll)) * 100}%` }}
                    >
                        <span className="text-[10px] font-bold text-white">
                            {((totalPremiumBpd / Math.max(1, totalAll)) * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Giveaway analysis */}
            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                <div className="text-center text-gray-500">
                    Regular Giveaway: {regularBlend.aki >= 87 ? '+' + (regularBlend.aki - 87).toFixed(1) + ' AKI' : 'N/A'}
                </div>
                <div className="text-center text-gray-500">
                    Mid Giveaway: {midBlend.aki >= 89 ? '+' + (midBlend.aki - 89).toFixed(1) + ' AKI' : 'N/A'}
                </div>
                <div className="text-center text-gray-500">
                    Premium Giveaway: {premiumBlend.aki >= 91 ? '+' + (premiumBlend.aki - 91).toFixed(1) + ' AKI' : 'N/A'}
                </div>
            </div>
        </div>
    );
};

// ─── Grade Card ───
const GradeCard: React.FC<{
    grade: string;
    targetAki: number;
    aki: number;
    ron: number;
    mon: number;
    costPerBbl: number;
    bpd: number;
    compliant: boolean;
    color: string;
}> = ({ grade, targetAki, aki, ron, mon, costPerBbl, bpd, compliant, color }) => (
    <div className="bg-gray-800 rounded-lg p-3 text-center border" style={{ borderColor: compliant ? color : '#ef4444' }}>
        <div className="text-xs font-bold mb-2" style={{ color }}>{grade}</div>
        <div className="text-2xl font-bold" style={{ color }}>{aki.toFixed(1)}</div>
        <div className="text-[11px] text-gray-500">AKI (Target ≥{targetAki})</div>
        <div className="flex justify-center gap-3 mt-2 text-[11px]">
            <span className="text-gray-400">RON: {ron.toFixed(0)}</span>
            <span className="text-gray-400">MON: {mon.toFixed(0)}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-1">{(bpd / 1000).toFixed(1)}k BPD</div>
        <div className="text-xs font-bold text-emerald-400 mt-1">${costPerBbl.toFixed(2)}/bbl</div>
        <div className={`text-[11px] font-bold mt-1 ${compliant ? 'text-green-400' : 'text-red-400'}`}>
            {compliant ? '✓ ON SPEC' : '✗ OFF SPEC'}
        </div>
    </div>
);

// ───────────────────────────────────────────────────────────────
// Diesel Blending Optimizer (Cetane/CFPP/Lubricity)
// ───────────────────────────────────────────────────────────────

export interface DieselComponent {
    id: string;
    name: string;
    volBpd: number;
    cetaneNumber: number;
    sulfurPpm: number;
    cloudPointF: number;
    cfppF: number;
    aromaticPct: number;
    viscosityCst: number;
    costPerBbl: number;
    locked?: boolean;
}

interface DieselBlendOptimizerProps {
    components: DieselComponent[];
    totalDesiredBpd: number;
    targetCetane: number;
    targetSulfurPpm: number;
    targetCFPPF: number;
    seasonGrade: 'summer' | 'winter' | 'arctic';
}

export const DieselBlendOptimizer: React.FC<DieselBlendOptimizerProps> = ({
    components: initialComps,
    totalDesiredBpd,
    targetCetane,
    targetSulfurPpm,
    targetCFPPF,
    seasonGrade
}) => {
    const [components, setComponents] = useState<DieselComponent[]>(initialComps);

    const updateVolume = useCallback((id: string, volBpd: number) => {
        setComponents(prev => prev.map(c =>
            c.id === id ? { ...c, volBpd: Math.max(0, volBpd) } : c
        ));
    }, []);

    const blendResults = useMemo(() => {
        const active = components.filter(c => c.volBpd > 0);
        if (active.length === 0) return null;

        const totalVol = active.reduce((s, c) => s + c.volBpd, 0);

        // Cetane blending (non-linear)
        let sumCetaneNL = 0;
        active.forEach(c => {
            sumCetaneNL += c.volBpd * Math.pow(c.cetaneNumber, 1.05);
        });
        const blendCetane = Math.pow(sumCetaneNL / totalVol, 1 / 1.05);

        // Sulfur (linear)
        const blendSulfur = active.reduce((s, c) => s + c.volBpd * c.sulfurPpm, 0) / totalVol;

        // CFPP (non-linear with cold flow index)
        let sumCFPP = 0;
        active.forEach(c => {
            sumCFPP += c.volBpd * Math.pow(10, (c.cfppF - 32) * 5 / 9 / 100);
        });
        const blendCFPP = (9 / 5 * Math.log10(sumCFPP / totalVol) * 100) + 32;

        const blendAromatic = active.reduce((s, c) => s + c.volBpd * c.aromaticPct, 0) / totalVol;

        // Lubricity (HFRR)
        const hfrr = 650 - blendSulfur * 0.05 + blendAromatic * 1.5;
        const lubricityAdditivePpm = hfrr > 400 ? (hfrr - 400) * 12 : 0;

        // Cost
        const totalCost = active.reduce((s, c) => s + c.volBpd * c.costPerBbl, 0);
        const costPerBbl = totalCost / Math.max(1, totalVol);

        return {
            totalVol,
            blendCetane,
            blendSulfur,
            blendCFPP,
            blendAromatic,
            hfrr,
            lubricityAdditivePpm,
            totalCost,
            costPerBbl,
            cetaneCompliant: blendCetane >= targetCetane,
            sulfurCompliant: blendSulfur <= targetSulfurPpm,
            cfppCompliant: blendCFPP <= targetCFPPF,
            allCompliant: blendCetane >= targetCetane && blendSulfur <= targetSulfurPpm && blendCFPP <= targetCFPPF,
        };
    }, [components, targetCetane, targetSulfurPpm, targetCFPPF]);

    return (
        <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-3">
                <h3 className="text-sm font-bold text-emerald-400">Diesel Blend Optimizer — {seasonGrade.toUpperCase()} Grade</h3>
            </div>

            {/* Components */}
            <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-bold text-gray-300 mb-2">Diesel Components</h4>
                <div className="grid grid-cols-1 gap-2">
                    {components.map(comp => (
                        <div key={comp.id} className="flex items-center gap-2 bg-gray-750 rounded p-2">
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-gray-200 truncate">{comp.name}</div>
                                <div className="text-[11px] text-gray-500">
                                    Cetane:{comp.cetaneNumber.toFixed(0)} S:{comp.sulfurPpm.toFixed(0)}ppm CFPP:{comp.cfppF.toFixed(0)}°F
                                </div>
                            </div>
                            <input
                                type="number"
                                value={comp.volBpd}
                                onChange={e => updateVolume(comp.id, Number(e.target.value))}
                                className="w-20 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded border border-gray-600 focus:border-emerald-500 outline-none"
                                step={100}
                                min={0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Results */}
            {blendResults && (
                <div className="bg-gray-900 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-gray-300 mb-2">Blend Properties</h4>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <SpecBadge label="Cetane" actual={blendResults.blendCetane.toFixed(1)} target={`≥${targetCetane}`} compliant={blendResults.cetaneCompliant} />
                        <SpecBadge label="Sulfur" actual={blendResults.blendSulfur.toFixed(0)} target={`≤${targetSulfurPpm}`} compliant={blendResults.sulfurCompliant} unit="ppm" />
                        <SpecBadge label="CFPP" actual={blendResults.blendCFPP.toFixed(0)} target={`≤${targetCFPPF}`} compliant={blendResults.cfppCompliant} unit="°F" />
                    </div>
                    <div className="text-[10px] text-gray-500 space-y-1">
                        <div>HFRR Wear Scar: {blendResults.hfrr.toFixed(0)} μm</div>
                        <div>Lubricity Additive: {blendResults.lubricityAdditivePpm.toFixed(0)} ppm</div>
                        <div>Blend Cost: <span className="text-emerald-400">${blendResults.costPerBbl.toFixed(2)}/bbl</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};