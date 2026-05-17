import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, ComposedChart, Cell, PieChart, Pie, Treemap,
    Sankey, Rectangle
} from 'recharts';

// ───────────────────────────────────────────────────────────────
// Animated Crude Distillation Tower - Tray-by-Tray Temperature Profile
// ───────────────────────────────────────────────────────────────
interface TrayData {
    tray: number;
    tempF: number;
    liquidBpd: number;
    vaporBpd: number;
    product?: string;
}

interface DistillationTowerProps {
    width?: number;
    height?: number;
    crudeFeedBpd: number;
    feedApi: number;
    furnaceOutletF: number;
    topPressurePsig: number;
    steamToCrudeRatio: number;
    animating: boolean;
}

export const AnimatedDistillationTower: React.FC<DistillationTowerProps> = ({
    width = 320,
    height = 560,
    crudeFeedBpd,
    feedApi,
    furnaceOutletF,
    topPressurePsig,
    steamToCrudeRatio,
    animating
}) => {
    const [animationFrame, setAnimationFrame] = useState(0);
    const animRef = useRef<number>(0);

    useEffect(() => {
        if (!animating) return;
        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            setAnimationFrame(frame);
        }, 50);
        return () => clearInterval(interval);
    }, [animating]);

    const trays = useMemo(() => {
        const numTrays = 40;
        const result: TrayData[] = [];
        const feedApiFactor = feedApi / 35;
        const tempRange = furnaceOutletF - 120;

        for (let i = 0; i < numTrays; i++) {
            const fractionDown = i / (numTrays - 1);
            // Non-linear temperature profile - steeper near bottom (flash zone)
            const normalizedTemp = Math.pow(1 - fractionDown, 1.3) * (1 + (feedApiFactor - 1) * 0.3);
            const tempF = 120 + tempRange * normalizedTemp;

            // Vapor/liquid traffic
            const vaporFraction = Math.pow(fractionDown, 0.7);
            const vaporBpd = crudeFeedBpd * 1.2 * vaporFraction;
            const liquidBpd = crudeFeedBpd * 0.8 * (1 - vaporFraction);

            let product: string | undefined;
            if (i === 0) product = 'Gas';
            else if (i === 2) product = 'Lt Naphtha';
            else if (i === 6) product = 'Hvy Naphtha';
            else if (i === 12) product = 'Kerosene';
            else if (i === 20) product = 'Diesel';
            else if (i === 28) product = 'HGO';
            else if (i === 36) product = 'Residue';

            result.push({ tray: numTrays - i, tempF, liquidBpd, vaporBpd, product });
        }
        return result;
    }, [crudeFeedBpd, feedApi, furnaceOutletF]);

    // Animation shimmer on liquid/vapor
    const shimmerOffset = Math.sin(animationFrame * 0.1) * 3;

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-cyan-400 text-center mb-2">Crude Distillation Tower</h3>
            <div className="relative" style={{ height: height - 80 }}>
                {/* Tower shell */}
                <div className="absolute left-1/2 -translate-x-1/2 w-32 h-full border-2 border-gray-600 rounded-lg bg-gray-800/50">
                    {/* Trays */}
                    {trays.map((tray, idx) => {
                        const yPos = (idx / (trays.length - 1)) * 100;
                        const isFlashZone = idx >= 30;
                        const hasProduct = !!tray.product;

                        return (
                            <div key={tray.tray} className="absolute w-full" style={{ bottom: `${yPos}%` }}>
                                {/* Tray line */}
                                <div
                                    className={`h-0.5 ${hasProduct ? 'bg-cyan-500' : 'bg-gray-600'}`}
                                    style={{
                                        width: '100%',
                                        opacity: 0.3 + (1 - yPos / 100) * 0.7
                                    }}
                                />
                                {/* Vapor rising animation */}
                                <div
                                    className="absolute bottom-0 left-1/4 w-1/2 bg-yellow-500/20 rounded-full"
                                    style={{
                                        height: `${Math.max(2, tray.vaporBpd / crudeFeedBpd * 8)}px`,
                                        transform: `translateY(${-shimmerOffset}px)`,
                                        transition: 'transform 0.05s'
                                    }}
                                />
                                {/* Product draw indicator */}
                                {hasProduct && (
                                    <div className="absolute -right-20 top-0 flex items-center gap-1">
                                        <div className="w-6 h-0.5 bg-green-400" />
                                        <span className="text-[10px] text-green-400 whitespace-nowrap">{tray.product}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Flash zone - feed entry */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 bg-orange-500/40 rounded-t-lg border border-orange-400">
                        <div className="text-[11px] text-orange-300 text-center mt-1">Flash Zone</div>
                        <div className="text-[10px] text-orange-200 text-center">{furnaceOutletF}°F</div>
                    </div>

                    {/* Overhead vapor line */}
                    <div className="absolute top-0 -right-16 w-16 h-1.5 bg-blue-400 rounded">
                        <div className="text-[11px] text-blue-300 -mt-4 text-center">Overhead</div>
                    </div>
                </div>

                {/* Temperature gradient bar (left side) */}
                <div className="absolute left-4 top-0 w-6 h-full bg-gradient-to-t from-red-600 via-orange-500 via-yellow-400 to-blue-500 rounded-full opacity-80">
                    <div className="absolute -left-14 top-0 text-[10px] text-red-400">{furnaceOutletF}°F</div>
                    <div className="absolute -left-10 bottom-0 text-[10px] text-blue-400">120°F</div>
                </div>

                {/* Animated particles - vapor rising */}
                {[...Array(12)].map((_, i) => {
                    const particlePhase = (animationFrame * 1.5 + i * 30) % 360;
                    const particleY = 5 + (95 * (1 + Math.sin(particlePhase * Math.PI / 180)) / 2);
                    return (
                        <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-yellow-400/60 rounded-full"
                            style={{
                                left: `${40 + Math.sin(animationFrame * 0.05 + i) * 15}%`,
                                bottom: `${particleY}%`,
                                opacity: 0.3 + Math.abs(Math.sin(particlePhase * Math.PI / 180)) * 0.7,
                                transition: 'bottom 0.05s'
                            }}
                        />
                    );
                })}
            </div>

            {/* Bottom stats */}
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>Feed: {(crudeFeedBpd / 1000).toFixed(0)}k BPD</span>
                <span>°API: {feedApi.toFixed(1)}</span>
                <span>P: {topPressurePsig.toFixed(0)} psig</span>
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Temperature Profile Chart - Tray by Tray
// ───────────────────────────────────────────────────────────────
interface TempProfileChartProps {
    trays: { tray: number; tempF: number }[];
    width?: number;
    height?: number;
}

export const TemperatureProfileChart: React.FC<TempProfileChartProps> = ({ trays, width = 400, height = 300 }) => (
    <div className="bg-gray-800 rounded-lg p-4" style={{ width, height }}>
        <h3 className="text-sm font-bold text-yellow-400 text-center mb-2">Temperature Profile</h3>
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trays} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="tempGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="tray" stroke="#9ca3af" tick={{ fontSize: 10 }} reversed />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    labelStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="tempF" stroke="#fbbf24" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// ───────────────────────────────────────────────────────────────
// FCC Riser + Regenerator Animation
// ───────────────────────────────────────────────────────────────
interface FCCUnitProps {
    width?: number;
    height?: number;
    feedBpd: number;
    riserOutletF: number;
    regeneratorTempF: number;
    catToOilRatio: number;
    conversion: number;
    cokeYieldWtPct: number;
    gasolineBpd: number;
    lcoBpd: number;
    propyleneBpd: number;
    animating: boolean;
}

export const AnimatedFCCUnit: React.FC<FCCUnitProps> = ({
    width = 500,
    height = 400,
    feedBpd,
    riserOutletF,
    regeneratorTempF,
    catToOilRatio,
    conversion,
    cokeYieldWtPct,
    gasolineBpd,
    lcoBpd,
    propyleneBpd,
    animating
}) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!animating) return;
        const interval = setInterval(() => setFrame(f => f + 1), 40);
        return () => clearInterval(interval);
    }, [animating]);

    const bubblePhase = (frame * 0.15) % 360;

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-orange-400 text-center mb-2">FCC Unit — Riser & Regenerator</h3>
            <div className="relative" style={{ height: height - 80 }}>
                {/* Riser (left side) */}
                <div className="absolute left-12 bottom-4 w-16 bg-gray-700 rounded-t-lg border border-gray-500" style={{ height: '75%' }}>
                    {/* Riser internal gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-orange-800/40 to-yellow-700/20 rounded-t-lg" />

                    {/* Rising catalyst particles */}
                    {[...Array(20)].map((_, i) => {
                        const particlePhase = (frame * 0.8 + i * 18) % 120;
                        const pctUp = particlePhase / 120;
                        return (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-orange-500 rounded-full opacity-70"
                                style={{
                                    left: `${8 + Math.sin(frame * 0.1 + i) * 20}px`,
                                    bottom: `${pctUp * 95}%`,
                                    transform: `scale(${0.5 + pctUp * 0.5})`
                                }}
                            />
                        );
                    })}

                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-green-400 whitespace-nowrap">
                        Feed + Steam
                    </div>
                    <div className="absolute -left-16 top-1/4 text-[11px] text-gray-400 whitespace-nowrap">
                        Cat: Oil {catToOilRatio}:1
                    </div>
                </div>

                {/* Riser top connection to reactor */}
                <div className="absolute left-28 top-12 w-32 h-3 bg-gray-600 rounded" />

                {/* Reactor vessel */}
                <div className="absolute left-36 top-4 w-20 h-20 bg-gray-700 rounded-full border border-gray-500 flex flex-col items-center justify-center">
                    <div className="text-[11px] text-yellow-300">{riserOutletF}°F</div>
                    <div className="text-[10px] text-gray-400">Reactor</div>
                    {/* Cyclones animation */}
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-8 h-8 border border-gray-500 rounded-full"
                            style={{
                                top: -12,
                                left: 4 + i * 14,
                                animation: `spin ${2 + i * 0.5}s linear infinite`
                            }}
                        />
                    ))}
                </div>

                {/* Product vapor line to fractionator */}
                <div className="absolute left-44 top-8 w-2 h-32 bg-blue-500/30 rounded">
                    <div className="absolute -right-16 top-2 text-[11px] text-blue-300 whitespace-nowrap">
                        To Fractionator
                    </div>
                    {/* Product flow animation */}
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={`prod-${i}`}
                            className="absolute w-2 h-2 bg-blue-400/60 rounded-full"
                            style={{
                                top: `${(frame * 1.5 + i * 12) % 100}%`,
                                left: -2
                            }}
                        />
                    ))}
                </div>

                {/* Spent catalyst line to regenerator */}
                <div className="absolute left-28 top-24 w-48 h-2 bg-gray-500 rounded flex items-center">
                    <div className="text-[10px] absolute -top-4 left-4 text-gray-500">Spent Cat + Coke</div>
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={`spent-${i}`}
                            className="absolute w-1.5 h-1.5 bg-gray-600 rounded-full"
                            style={{ left: `${(frame * 1 + i * 15) % 100}%`, top: 0 }}
                        />
                    ))}
                </div>

                {/* Regenerator */}
                <div className="absolute right-12 top-16 w-24 h-32 bg-red-900/50 rounded-lg border border-red-700">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 to-red-800/60 rounded-lg" />
                    {/* Fire/smoke animation */}
                    {[...Array(15)].map((_, i) => {
                        const flickerH = 30 + Math.sin(frame * 0.2 + i * 0.7) * 20;
                        return (
                            <div
                                key={`fire-${i}`}
                                className="absolute bottom-2 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full opacity-60"
                                style={{
                                    left: `${4 + (i % 3) * 24 + Math.sin(frame * 0.15 + i) * 8}px`,
                                    width: '8px',
                                    height: `${flickerH}px`,
                                    opacity: 0.3 + Math.abs(Math.sin(frame * 0.2 + i)) * 0.5
                                }}
                            />
                        );
                    })}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] text-red-300 whitespace-nowrap">
                        {regeneratorTempF}°F
                    </div>
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                        Regenerator
                    </div>
                    {/* Air inlet */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-blue-300">Air In</div>
                    {/* Flue gas */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">Flue Gas</div>
                </div>

                {/* Regenerated catalyst return line */}
                <div className="absolute left-44 bottom-12 w-48 h-2 bg-red-500/50 rounded flex items-center">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={`regen-${i}`}
                            className="absolute w-1.5 h-1.5 bg-red-400 rounded-full"
                            style={{ left: `${(100 - (frame * 1 + i * 15)) % 100}%`, top: 0 }}
                        />
                    ))}
                </div>
            </div>

            {/* Stats row */}
            <div className="flex justify-between mt-1 text-[10px]">
                <span className="text-green-400">Conv: {conversion.toFixed(1)}%</span>
                <span className="text-yellow-400">Gasoline: {(gasolineBpd / 1000).toFixed(0)}k</span>
                <span className="text-blue-400">LCO: {(lcoBpd / 1000).toFixed(0)}k</span>
                <span className="text-purple-400">C3=: {(propyleneBpd / 1000).toFixed(1)}k</span>
                <span className="text-gray-500">Coke: {cokeYieldWtPct.toFixed(2)}wt%</span>
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// FCC Yield Distribution Pie Chart
// ───────────────────────────────────────────────────────────────
interface YieldPieChartProps {
    gasolineBpd: number;
    lcoBpd: number;
    slurryBpd: number;
    propyleneBpd: number;
    butyleneBpd: number;
    dryGasBpd: number;
    cokeBpd: number;
    width?: number;
    height?: number;
}

const YIELD_COLORS = ['#f59e0b', '#3b82f6', '#6b7280', '#8b5cf6', '#ec4899', '#ef4444', '#10b981'];

export const YieldPieChart: React.FC<YieldPieChartProps> = ({
    gasolineBpd, lcoBpd, slurryBpd, propyleneBpd,
    butyleneBpd, dryGasBpd, cokeBpd, width = 400, height = 300
}) => {
    const data = [
        { name: 'Gasoline', value: gasolineBpd },
        { name: 'LCO', value: lcoBpd },
        { name: 'Slurry', value: slurryBpd },
        { name: 'Propylene', value: propyleneBpd },
        { name: 'Butylene', value: butyleneBpd },
        { name: 'Dry Gas', value: dryGasBpd },
        { name: 'Coke', value: cokeBpd },
    ].filter(d => d.value > 0);

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="bg-gray-800 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-cyan-400 text-center mb-2">FCC Yield Distribution</h3>
            <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                    >
                        {data.map((_, idx) => (
                            <Cell key={idx} fill={YIELD_COLORS[idx % YIELD_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [(value / 1000).toFixed(1) + 'k BPD']}
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-[10px] text-gray-500">Total: {(total / 1000).toFixed(0)}k BPD</div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Hydrogen Network Sankey Diagram (simplified)
// ───────────────────────────────────────────────────────────────
interface HydrogenSankeyProps {
    sources: { name: string; mmscfd: number; purity: number }[];
    sinks: { name: string; mmscfd: number }[];
    freshH2: number;
    width?: number;
    height?: number;
}

export const HydrogenSankey: React.FC<HydrogenSankeyProps> = ({
    sources, sinks, freshH2, width = 500, height = 300
}) => {
    const totalSources = sources.reduce((s, src) => s + src.mmscfd, 0) + freshH2;
    const totalSinks = sinks.reduce((s, snk) => s + snk.mmscfd, 0);
    const scale = Math.max(totalSources, totalSinks, 1);

    const sourceNodes = [
        { name: 'SMR/Reformer', value: freshH2, color: '#3b82f6' },
        ...sources.map(s => ({ name: s.name, value: s.mmscfd, color: '#10b981' }))
    ];

    const sinkNodes = sinks.map(s => ({ name: s.name, value: s.mmscfd, color: '#f59e0b' }));

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-blue-400 text-center mb-2">Hydrogen Network — Sankey</h3>
            <div className="flex" style={{ height: height - 70 }}>
                {/* Source bars */}
                <div className="w-1/4 flex flex-col gap-1 justify-center">
                    {sourceNodes.map((src, idx) => {
                        const barH = Math.max(8, (src.value / scale) * 180);
                        return (
                            <div key={idx} className="flex items-center gap-1">
                                <div
                                    className="rounded-r transition-all duration-300 flex items-center justify-end px-1"
                                    style={{
                                        width: `${Math.max(30, barH / 180 * 100)}%`,
                                        height: '24px',
                                        backgroundColor: src.color,
                                        minWidth: '20px'
                                    }}
                                >
                                    <span className="text-[10px] text-white font-bold">{src.value.toFixed(1)}</span>
                                </div>
                                <span className="text-[11px] text-gray-400 truncate">{src.name}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Flow lines */}
                <div className="flex-1 relative">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        {sourceNodes.map((src, si) => {
                            const srcY = (si + 0.5) * (180 / sourceNodes.length) + 20;
                            return sinkNodes.map((snk, di) => {
                                const snkY = (di + 0.5) * (180 / sinkNodes.length) + 20;
                                const opacity = 0.1 + (src.value / totalSources) * 0.4;
                                return (
                                    <path
                                        key={`${si}-${di}`}
                                        d={`M 0 ${srcY} C 80 ${srcY}, 80 ${snkY}, 160 ${snkY}`}
                                        stroke={src.color}
                                        strokeWidth={Math.max(1, (src.value / scale) * 8)}
                                        fill="none"
                                        opacity={opacity}
                                    />
                                );
                            });
                        })}
                    </svg>
                </div>

                {/* Sink bars */}
                <div className="w-1/4 flex flex-col gap-1 justify-center">
                    {sinkNodes.map((snk, idx) => {
                        const barH = Math.max(8, (snk.value / scale) * 180);
                        return (
                            <div key={idx} className="flex items-center gap-1 justify-end">
                                <span className="text-[11px] text-gray-400 truncate">{snk.name}</span>
                                <div
                                    className="rounded-l transition-all duration-300 flex items-center px-1"
                                    style={{
                                        width: `${Math.max(30, barH / 180 * 100)}%`,
                                        height: '24px',
                                        backgroundColor: snk.color,
                                        minWidth: '20px'
                                    }}
                                >
                                    <span className="text-[10px] text-white font-bold">{snk.value.toFixed(1)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Total Production: {totalSources.toFixed(1)} MMscfd</span>
                <span>Total Demand: {totalSinks.toFixed(1)} MMscfd</span>
                <span className={totalSources >= totalSinks ? 'text-green-400' : 'text-red-400'}>
                    Balance: {(totalSources - totalSinks).toFixed(1)} MMscfd
                </span>
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Refinery Product Yield Treemap
// ───────────────────────────────────────────────────────────────
interface ProductYieldData {
    name: string;
    value: number;
    color: string;
    unit?: string;
}

interface YieldTreemapProps {
    products: ProductYieldData[];
    width?: number;
    height?: number;
}

export const YieldTreemap: React.FC<YieldTreemapProps> = ({ products, width = 500, height = 300 }) => {
    const total = products.reduce((s, p) => s + p.value, 0);

    return (
        <div className="bg-gray-800 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-emerald-400 text-center mb-2">Product Yield Treemap</h3>
            <div className="flex flex-wrap gap-1" style={{ height: height - 70, overflow: 'hidden' }}>
                {products.map((p, idx) => {
                    const pct = (p.value / Math.max(1, total)) * 100;
                    const cellW = pct > 30 ? '100%' : pct > 15 ? '48%' : '31%';
                    const cellH = pct > 30 ? '60%' : pct > 15 ? '40%' : '30%';
                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-center rounded transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                width: cellW,
                                height: cellH,
                                backgroundColor: p.color + '40',
                                border: `1px solid ${p.color}80`,
                            }}
                        >
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className="text-lg font-bold" style={{ color: p.color }}>
                                {p.value >= 1000 ? (p.value / 1000).toFixed(1) + 'k' : p.value.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-gray-500">{p.unit || 'BPD'} ({pct.toFixed(1)}%)</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Live Crude Assay - TBP Curve (animated)
// ───────────────────────────────────────────────────────────────
interface TBPCurveProps {
    crudeName: string;
    api: number;
    sulfurWtPct: number;
    tbpData: { volPct: number; tempF: number }[];
    width?: number;
    height?: number;
}

export const TBPCurve: React.FC<TBPCurveProps> = ({ crudeName, api, sulfurWtPct, tbpData, width = 500, height = 300 }) => {
    const productCuts = [
        { name: 'Lt Naphtha', min: 0, max: 15, color: '#60a5fa' },
        { name: 'Hvy Naphtha', min: 15, max: 30, color: '#818cf8' },
        { name: 'Kerosene', min: 30, max: 45, color: '#34d399' },
        { name: 'Diesel', min: 45, max: 62, color: '#fbbf24' },
        { name: 'HGO', min: 62, max: 78, color: '#f87171' },
        { name: 'Residue', min: 78, max: 100, color: '#9ca3af' },
    ];

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-cyan-400">TBP Curve — {crudeName}</h3>
                <div className="flex gap-3 text-[10px]">
                    <span className="text-yellow-400">°API: {api.toFixed(1)}</span>
                    <span className="text-orange-400">S: {sulfurWtPct.toFixed(2)}%</span>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={tbpData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="volPct" stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: 'Vol% Distilled', position: 'bottom', offset: -5, style: { fill: '#9ca3af', fontSize: 10 } }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: '°F', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    {/* Product cut regions */}
                    {productCuts.map(cut => (
                        <Area
                            key={cut.name}
                            dataKey="tempF"
                            fill={cut.color}
                            fillOpacity={0.15}
                            stroke="none"
                            data={tbpData.filter(d => d.volPct >= cut.min && d.volPct <= cut.max)}
                        />
                    ))}
                    <Line type="monotone" dataKey="tempF" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
            {/* Product cut legend */}
            <div className="flex flex-wrap gap-2 mt-1">
                {productCuts.map(cut => (
                    <div key={cut.name} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: cut.color }} />
                        <span className="text-[11px] text-gray-400">{cut.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Refinery Economics Dashboard - Live Margins
// ───────────────────────────────────────────────────────────────
interface EconomicsDashboardProps {
    crudeCostPerBbl: number;
    productRevenuePerBbl: number;
    opexPerBbl: number;
    marginPerBbl: number;
    crackSpread: number;
    utilizationPct: number;
    nci: number;
    width?: number;
}

export const EconomicsDashboard: React.FC<EconomicsDashboardProps> = ({
    crudeCostPerBbl, productRevenuePerBbl, opexPerBbl,
    marginPerBbl, crackSpread, utilizationPct, nci, width = 500
}) => {
    const marginColor = marginPerBbl >= 10 ? '#10b981' : marginPerBbl >= 0 ? '#f59e0b' : '#ef4444';
    const bars = [
        { name: 'Crude Cost', value: crudeCostPerBbl, color: '#6b7280' },
        { name: 'Revenue', value: productRevenuePerBbl, color: '#3b82f6' },
        { name: 'OPEX', value: opexPerBbl, color: '#f59e0b' },
        { name: 'Margin', value: marginPerBbl, color: marginColor },
    ];

    // Animated margin indicator
    const marginWidth = Math.min(100, Math.max(5, ((marginPerBbl + 5) / 30) * 100));

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width }}>
            <h3 className="text-sm font-bold text-emerald-400 text-center mb-3">Refinery Economics</h3>

            {/* Bar chart */}
            <div className="flex items-end gap-3 h-28 mb-3">
                {bars.map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-bold" style={{ color: bar.color }}>
                            ${bar.value.toFixed(2)}
                        </span>
                        <div
                            className="w-full rounded-t transition-all duration-500"
                            style={{
                                height: `${Math.min(90, (bar.value / Math.max(1, productRevenuePerBbl)) * 90)}%`,
                                backgroundColor: bar.color + '80',
                                borderTop: `2px solid ${bar.color}`,
                            }}
                        />
                        <span className="text-[11px] text-gray-500 mt-1">{bar.name}</span>
                    </div>
                ))}
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-lg font-bold" style={{ color: marginColor }}>${marginPerBbl.toFixed(2)}</div>
                    <div className="text-[11px] text-gray-500">Margin/bbl</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-lg font-bold text-cyan-400">${crackSpread.toFixed(2)}</div>
                    <div className="text-[11px] text-gray-500">Crack Spread</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-lg font-bold text-blue-400">{utilizationPct.toFixed(1)}%</div>
                    <div className="text-[11px] text-gray-500">Utilization</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-lg font-bold text-purple-400">{nci.toFixed(1)}</div>
                    <div className="text-[11px] text-gray-500">NCI</div>
                </div>
            </div>

            {/* Margin gauge */}
            <div className="mt-2">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>-$5</span><span>$0</span><span>$25+</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${marginWidth}%`,
                            background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Heat Exchanger Network - Temperature Approach Chart
// ───────────────────────────────────────────────────────────────
interface HeatExchangerNetworkProps {
    hotComposite: { dutyMMBtuHr: number; tempF: number }[];
    coldComposite: { dutyMMBtuHr: number; tempF: number }[];
    minApproachF: number;
    pinchTempF: number;
    width?: number;
    height?: number;
}

export const HeatExchangerNetwork: React.FC<HeatExchangerNetworkProps> = ({
    hotComposite, coldComposite, minApproachF, pinchTempF, width = 500, height = 300
}) => (
    <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
        <h3 className="text-sm font-bold text-orange-400 text-center mb-2">Heat Exchanger Pinch Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
            <ComposedChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dutyMMBtuHr" stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: 'Duty (MMBtu/hr)', position: 'bottom', style: { fill: '#9ca3af', fontSize: 10 } }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['dataMin - 20', 'dataMax + 20']} label={{ value: '°F', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                {/* Hot composite */}
                <Line data={hotComposite} dataKey="tempF" stroke="#ef4444" strokeWidth={2} dot={false} />
                {/* Cold composite */}
                <Line data={coldComposite} dataKey="tempF" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-[10px] mt-1">
            <span className="text-red-400">Hot Composite</span>
            <span className="text-yellow-400">Pinch: {pinchTempF}°F</span>
            <span className="text-blue-400">Cold Composite</span>
            <span className="text-gray-500">ΔTmin: {minApproachF}°F</span>
        </div>
    </div>
);

// ───────────────────────────────────────────────────────────────
// Sulfur Recovery Unit - Conversion Cascade
// ───────────────────────────────────────────────────────────────
interface SRUCascadeProps {
    stages: { stage: number; conversion: number; remainingH2S: number }[];
    totalSulfurLtpd: number;
    overallEfficiency: number;
    width?: number;
}

export const SRUCascade: React.FC<SRUCascadeProps> = ({ stages, totalSulfurLtpd, overallEfficiency, width = 400 }) => (
    <div className="bg-gray-800 rounded-lg p-4" style={{ width }}>
        <h3 className="text-sm font-bold text-yellow-400 text-center mb-2">Claus SRU — Stage Cascade</h3>
        <div className="flex gap-2 items-end h-24 mb-2">
            {stages.map((stage, idx) => {
                const heightPct = stage.remainingH2S / Math.max(0.1, stages[0]?.remainingH2S || 1) * 100;
                return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-gray-300">{stage.remainingH2S.toFixed(1)}%</span>
                        <div
                            className="w-full rounded-t transition-all duration-300"
                            style={{
                                height: `${heightPct}%`,
                                background: `linear-gradient(to top, #f59e0b, #ef4444)`,
                                opacity: 0.7
                            }}
                        />
                        <span className="text-[11px] text-gray-500 mt-1">Stage {stage.stage}</span>
                    </div>
                );
            })}
        </div>
        <div className="flex justify-between text-[10px]">
            <span className="text-green-400">Sulfur: {totalSulfurLtpd.toFixed(0)} LT/d</span>
            <span className="text-cyan-400">Efficiency: {overallEfficiency.toFixed(1)}%</span>
        </div>
    </div>
);

// ───────────────────────────────────────────────────────────────
// Animated Live Process Flow - Particle Streams
// ───────────────────────────────────────────────────────────────
interface ProcessFlowStreamProps {
    streams: {
        id: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        flowRate: number;
        color: string;
        label: string;
        temperature?: number;
        pressure?: number;
    }[];
    width?: number;
    height?: number;
    animating: boolean;
}

export const AnimatedProcessFlows: React.FC<ProcessFlowStreamProps> = ({
    streams, width = 600, height = 400, animating
}) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!animating) return;
        const interval = setInterval(() => setFrame(f => f + 1), 30);
        return () => clearInterval(interval);
    }, [animating]);

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width, height }}>
            <h3 className="text-sm font-bold text-cyan-400 text-center mb-2">Live Process Flow</h3>
            <div className="relative" style={{ height: height - 70 }}>
                <svg width="100%" height="100%" className="absolute inset-0">
                    {streams.map(stream => {
                        const dx = stream.to.x - stream.from.x;
                        const dy = stream.to.y - stream.from.y;
                        const maxFlow = Math.max(...streams.map(s => s.flowRate), 1);
                        const thickness = 1 + (stream.flowRate / maxFlow) * 6;

                        // Curved path
                        const midX = (stream.from.x + stream.to.x) / 2;
                        const midY = Math.max(stream.from.y, stream.to.y) - 40;
                        const d = `M ${stream.from.x} ${stream.from.y} Q ${midX} ${midY} ${stream.to.x} ${stream.to.y}`;

                        const particleCount = Math.floor(stream.flowRate / Math.max(1, maxFlow) * 15) + 3;

                        return (
                            <g key={stream.id}>
                                {/* Stream path */}
                                <path d={d} stroke={stream.color} strokeWidth={thickness} fill="none" opacity={0.5} />
                                {/* Animated particles */}
                                {[...Array(particleCount)].map((_, i) => {
                                    const t = ((frame * 0.3 + i * (100 / particleCount)) % 100) / 100;
                                    // Quadratic bezier interpolation at parameter t
                                    const x = (1 - t) * (1 - t) * stream.from.x + 2 * (1 - t) * t * midX + t * t * stream.to.x;
                                    const y = (1 - t) * (1 - t) * stream.from.y + 2 * (1 - t) * t * midY + t * t * stream.to.y;
                                    return (
                                        <circle
                                            key={`${stream.id}-p-${i}`}
                                            cx={x}
                                            cy={y}
                                            r={2.5}
                                            fill={stream.color}
                                            opacity={0.8}
                                        />
                                    );
                                })}
                                {/* Label */}
                                <text
                                    x={midX}
                                    y={midY - 8}
                                    fill={stream.color}
                                    fontSize={9}
                                    textAnchor="middle"
                                    fontWeight="bold"
                                >
                                    {stream.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Unit operation boxes */}
                {streams.reduce<{ id: string; x: number; y: number; label: string; color: string }[]>((acc, s) => {
                    const addNode = (node: { x: number; y: number }, type: 'from' | 'to') => {
                        const id = `${s.id}-${type}`;
                        const exists = acc.find(a => Math.abs(a.x - node.x) < 10 && Math.abs(a.y - node.y) < 10);
                        if (!exists) {
                            acc.push({
                                id,
                                x: node.x,
                                y: node.y,
                                label: type === 'from' ? s.label.split('→')[0]?.trim() || s.label : s.label.split('→')[1]?.trim() || s.label,
                                color: s.color
                            });
                        }
                    };
                    addNode(s.from, 'from');
                    addNode(s.to, 'to');
                    return acc;
                }, []).map((node, idx) => (
                    <div
                        key={node.id}
                        className="absolute px-2 py-1 rounded border text-[11px] font-bold"
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: node.color + '20',
                            borderColor: node.color + '60',
                            color: node.color,
                        }}
                    >
                        {node.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Comprehensive Refinery Dashboard
// ───────────────────────────────────────────────────────────────
interface RefineryDashboardProps {
    crudeBpd: number;
    products: { name: string; bpd: number; valuePerBbl: number }[];
    energyIntensity: number;
    co2Tpd: number;
    sulfurTpd: number;
    hydrogenBalance: number;
    width?: number;
}

export const RefineryDashboard: React.FC<RefineryDashboardProps> = ({
    crudeBpd, products, energyIntensity, co2Tpd, sulfurTpd, hydrogenBalance, width = 600
}) => {
    const totalProductBpd = products.reduce((s, p) => s + p.bpd, 0);
    const totalRevenue = products.reduce((s, p) => s + p.bpd * p.valuePerBbl, 0);

    return (
        <div className="bg-gray-900 rounded-lg p-4" style={{ width }}>
            <h3 className="text-sm font-bold text-cyan-400 text-center mb-3">Refinery Operations Dashboard</h3>

            {/* Top KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{(crudeBpd / 1000).toFixed(0)}k</div>
                    <div className="text-[10px] text-gray-500">Crude BPD</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{energyIntensity.toFixed(0)}</div>
                    <div className="text-[10px] text-gray-500">EII (Solomon)</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${hydrogenBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {hydrogenBalance.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-gray-500">H₂ Balance MMscfd</div>
                </div>
            </div>

            {/* Product bar */}
            <div className="flex items-end gap-1 h-20 mb-2">
                {products.map((p, idx) => {
                    const maxBpd = Math.max(...products.map(x => x.bpd), 1);
                    const pct = (p.bpd / maxBpd) * 100;
                    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#ef4444', '#6b7280'];
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                            <span className="text-[10px] text-gray-400">{(p.bpd / 1000).toFixed(0)}k</span>
                            <div
                                className="w-full rounded-t transition-all duration-500"
                                style={{
                                    height: `${pct}%`,
                                    background: `linear-gradient(to top, ${colors[idx % colors.length]}80, ${colors[idx % colors.length]})`,
                                }}
                            />
                            <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">{p.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* Bottom KPIs */}
            <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Total Product: {(totalProductBpd / 1000).toFixed(0)}k BPD</span>
                <span className="text-emerald-400">Revenue: ${(totalRevenue / 1e6).toFixed(1)}M/d</span>
                <span className="text-red-400">CO₂: {co2Tpd.toFixed(0)} T/d</span>
                <span className="text-yellow-400">S: {sulfurTpd.toFixed(0)} LT/d</span>
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────────────
// Export combined
// ───────────────────────────────────────────────────────────────
export const RefineryVisuals = {
    AnimatedDistillationTower,
    TemperatureProfileChart,
    AnimatedFCCUnit,
    YieldPieChart,
    HydrogenSankey,
    YieldTreemap,
    TBPCurve,
    EconomicsDashboard,
    HeatExchangerNetwork,
    SRUCascade,
    AnimatedProcessFlows,
    RefineryDashboard,
};