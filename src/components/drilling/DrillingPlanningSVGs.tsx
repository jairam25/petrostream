import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// ── Well Planning Depth vs Days Curve ──
export function TimeDepthCurveSVG({
    plannedDays, actualDays, td, depths, daysPlanned, daysActual
}: { plannedDays: number; actualDays: number; td: number; depths: number[]; daysPlanned: number[]; daysActual: number[] }) {
    const w = 340, h = 300, ml = 55, mr = 20, mt = 25, mb = 40;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxDepth = Math.max(td, depths.length > 0 ? Math.max(...depths) : 15000) * 1.05;
    const maxDays = Math.max(plannedDays, actualDays, daysPlanned.length > 0 ? Math.max(...daysPlanned) : 30) * 1.15;
    const toY = (d: number) => mt + (d / maxDepth) * ph;
    const toX = (d: number) => ml + ((d) / maxDays) * pw;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Grid */}
            {Array.from({ length: 6 }, (_, i) => {
                const y = mt + (i / 5) * ph;
                return <line key={i} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
                const x = ml + (i / 4) * pw;
                return <line key={i} x1={x} y1={mt} x2={x} y2={mt + ph} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
            })}
            {/* Planned curve */}
            <motion.polyline
                points={depths.map((d, i) => `${toX(daysPlanned[i] || 0)},${toY(d)}`).join(" ")}
                fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Actual curve (animated dashed) */}
            <motion.polyline
                points={depths.map((d, i) => `${toX(daysActual[i] || 0)},${toY(d)}`).join(" ")}
                fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" strokeLinejoin="round" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />
            {/* TD horizontal */}
            <motion.line x1={ml} y1={toY(td)} x2={ml + pw} y2={toY(td)} stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1 }} />
            <text x={ml + pw - 4} y={toY(td) - 6} fill="#22c55e" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">TD {td.toFixed(0)}′</text>
            {/* Legend */}
            <rect x={ml + 10} y={mt + 6} width={10} height={3} rx="1" fill="#3b82f6" />
            <text x={ml + 24} y={mt + 12} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold">AFE</text>
            <rect x={ml + 10} y={mt + 18} width={10} height={3} rx="1" fill="#ef4444" />
            <text x={ml + 24} y={mt + 24} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">ACTUAL</text>
            <text x={ml + pw / 2} y={mt + ph + 18} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DAYS</text>
        </svg>
    );
}

// ── AFE Cost Pie Breakdown ──
export function AFECostPieSVG({
    drillingCost, casingCost, cementCost, mudCost, rigCost, servicesCost
}: { drillingCost: number; casingCost: number; cementCost: number; mudCost: number; rigCost: number; servicesCost: number }) {
    const w = 280, h = 260, cx = 140, cy = 125, r = 95;
    const total = drillingCost + casingCost + cementCost + mudCost + rigCost + servicesCost || 1;
    const segments = [
        { name: "DRILLING", value: drillingCost, color: "#3b82f6" },
        { name: "CASING", value: casingCost, color: "#f59e0b" },
        { name: "CEMENT", value: cementCost, color: "#8b5cf6" },
        { name: "MUD", value: mudCost, color: "#a16207" },
        { name: "RIG", value: rigCost, color: "#22c55e" },
        { name: "SERVICES", value: servicesCost, color: "#ef4444" },
    ];
    let cumulativeAngle = -90;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {segments.filter(s => s.value > 0).map(s => {
                const angle = (s.value / total) * 360;
                const startAngle = cumulativeAngle;
                const endAngle = startAngle + angle;
                cumulativeAngle = endAngle;
                const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
                const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
                const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
                const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
                const largeArc = angle > 180 ? 1 : 0;
                return (
                    <motion.path key={s.name} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={s.color + "30"} stroke={s.color} strokeWidth="1.5"
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 120 }} />
                );
            })}
            <circle cx={cx} cy={cy} r={r * 0.55} fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <text x={cx} y={cy - 2} fill="#3b82f6" fontSize="14" fontFamily="monospace" fontWeight="black" textAnchor="middle">${(total / 1e6).toFixed(2)}M</text>
            <text x={cx} y={cy + 14} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AFE TOTAL</text>
            {/* Legend */}
            {segments.filter(s => s.value > 0).slice(0, 6).map((s, i) => (
                <g key={s.name}>
                    <rect x={12} y={190 + i * 11} width={8} height={8} rx="2" fill={s.color + "80"} />
                    <text x={24} y={197 + i * 11} fill={s.color} fontSize="6" fontFamily="monospace" fontWeight="bold">{s.name}</text>
                    <text x={140} y={197 + i * 11} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="end">{((s.value / total) * 100).toFixed(0)}%</text>
                </g>
            ))}
        </svg>
    );
}

// ── NPT vs ILT KPI Gauge ──
export function NPTGaugeSVG({ nptPercent, iltPercent, targetNPT }: { nptPercent: number; iltPercent: number; targetNPT: number }) {
    const w = 220, h = 200, cx = 110, cy = 125, r = 85;
    const angle = Math.min(240, (nptPercent / 50) * 240);
    const needleX = cx + r * 0.7 * Math.cos(((angle - 120) * Math.PI) / 180);
    const needleY = cy + r * 0.7 * Math.sin(((angle - 120) * Math.PI) / 180);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="nptGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            <circle cx={cx} cy={cy} r={r + 5} fill="url(#nptGlow)" />
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            {/* Green/Yellow/Red arc */}
            {[0, 1, 2].map(zone => (
                <path key={zone} d={`
                    M ${cx + r * Math.cos((-120 + zone * 80) * Math.PI / 180)} ${cy + r * Math.sin((-120 + zone * 80) * Math.PI / 180)}
                    A ${r} ${r} 0 0 1 ${cx + r * Math.cos((-120 + (zone + 1) * 80) * Math.PI / 180)} ${cy + r * Math.sin((-120 + (zone + 1) * 80) * Math.PI / 180)}
                `}
                    fill="none" stroke={zone === 0 ? "#22c55e" : zone === 1 ? "#f59e0b" : "#ef4444"} strokeWidth="8" opacity="0.6"
                    strokeDasharray={zone === 1 ? "8,3" : ""} />
            ))}
            {/* Needle */}
            <motion.line
                animate={{ x1: cx, y1: cy, x2: needleX, y2: needleY }}
                initial={{ x1: cx, y1: cy, x2: cx + r * 0.7, y2: cy }}
                style={{ stroke: nptPercent > 15 ? "#ef4444" : nptPercent > 7 ? "#f59e0b" : "#22c55e", strokeWidth: "3", strokeLinecap: "round" }}
                transition={{ type: "spring", stiffness: 70 }} />
            <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <text x={cx} y={cy + 28} fill={nptPercent > 15 ? "#ef4444" : "#22c55e"} fontSize="18" fontFamily="monospace" fontWeight="black" textAnchor="middle">{nptPercent.toFixed(1)}%</text>
            <text x={cx} y={cy + 44} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">NPT</text>
            <text x={cx - r + 20} y={cy + 20} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold">0%</text>
            <text x={cx + r - 15} y={cy + 20} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">50%</text>
        </svg>
    );
}