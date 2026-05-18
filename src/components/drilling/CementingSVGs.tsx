import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// ── Cement Slurry Density vs Depth Profile ──
export function CementSlurryProfileSVG({
    depths, slurryDensities, leadDensity, tailDensity, spacerDensity, mudWeight,
    topOfCement, shoeDepth
}: {
    depths: number[]; slurryDensities: number[]; leadDensity: number; tailDensity: number;
    spacerDensity: number; mudWeight: number; topOfCement: number; shoeDepth: number;
}) {
    const w = 320, h = 380, ml = 60, mr = 20, mt = 30, mb = 35;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxDepth = Math.max(shoeDepth, depths.length > 0 ? Math.max(...depths) : 10000) * 1.05;
    const minDensity = Math.min(mudWeight * 0.9, spacerDensity * 0.9, leadDensity * 0.95) - 0.5;
    const maxDensity = Math.max(tailDensity, leadDensity, slurryDensities.length > 0 ? Math.max(...slurryDensities) : 16) * 1.08;
    const toY = (d: number) => mt + (d / maxDepth) * ph;
    const toX = (ppg: number) => ml + ((ppg - minDensity) / (maxDensity - minDensity)) * pw;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="cementGrad" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#a16207" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#a16207" stopOpacity="0.1" />
                </linearGradient>
            </defs>
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            <rect x={ml} y={mt} width={pw} height={ph} fill="url(#cementGrad)" rx="8" />
            {/* Reference lines */}
            <line x1={toX(mudWeight)} y1={mt} x2={toX(mudWeight)} y2={mt + ph} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            <line x1={toX(leadDensity)} y1={mt} x2={toX(leadDensity)} y2={mt + ph} stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            <line x1={toX(tailDensity)} y1={mt} x2={toX(tailDensity)} y2={mt + ph} stroke="#a16207" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            {/* Slurry density profile */}
            {depths.length > 1 && (
                <motion.polyline
                    points={depths.map((d, i) => `${toX(slurryDensities[i] || leadDensity)},${toY(d)}`).join(" ")}
                    fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            )}
            {/* TOC & Shoe markers */}
            <motion.line x1={ml} y1={toY(topOfCement)} x2={ml + pw} y2={toY(topOfCement)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,3"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1 }} />
            <text x={ml + pw - 4} y={toY(topOfCement) - 6} fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">TOC</text>
            <motion.line x1={ml} y1={toY(shoeDepth)} x2={ml + pw} y2={toY(shoeDepth)} stroke="#ef4444" strokeWidth="1" strokeDasharray="5,3"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.2 }} />
            <text x={ml + pw - 4} y={toY(shoeDepth) - 6} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">SHOE</text>
            {/* Legend */}
            <circle cx={ml + 10} cy={mt + 8} r="3" fill="#3b82f6" />
            <text x={ml + 18} y={mt + 12} fill="#3b82f6" fontSize="6" fontFamily="monospace" fontWeight="bold">MUD</text>
            <circle cx={ml + 10} cy={mt + 20} r="3" fill="#8b5cf6" />
            <text x={ml + 18} y={mt + 24} fill="#8b5cf6" fontSize="6" fontFamily="monospace" fontWeight="bold">LEAD</text>
            <circle cx={ml + 10} cy={mt + 32} r="3" fill="#a16207" />
            <text x={ml + 18} y={mt + 36} fill="#a16207" fontSize="6" fontFamily="monospace" fontWeight="bold">TAIL</text>
            <text x={ml + pw / 2} y={h - 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DENSITY (ppg)</text>
        </svg>
    );
}

// ── Cement Plug / Balanced Plug Animation ──
export function BalancedPlugSVG({
    plugDepth, plugLength, wellboreID, pipeOD, displacementVol, cementVol
}: {
    plugDepth: number; plugLength: number; wellboreID: number; pipeOD: number;
    displacementVol: number; cementVol: number;
}) {
    const w = 240, h = 300, ml = 40, mr = 15, mt = 20, mb = 25;
    const pw = w - ml - mr, cx = ml + pw / 2;
    const totalH = h - mt - mb;
    const columnH = Math.min(totalH * 0.85, totalH);
    const plugPixels = Math.max(20, (plugLength / (plugDepth + plugLength || 1)) * columnH * 0.4);
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={totalH} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Wellbore casing */}
            <rect x={ml + 6} y={mt + 4} width={pw - 12} height={totalH - 8} fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
            {/* Displacement fluid */}
            <motion.rect x={ml + 10} y={mt + 8} width={pw - 20} height={totalH - plugPixels - 30}
                fill="#3b82f6" opacity="0.25" rx="2"
                initial={{ height: 0, y: mt + totalH - 16 }}
                animate={animated ? { height: totalH - plugPixels - 30, y: mt + 8 } : {}}
                transition={{ type: "spring", stiffness: 80 }} />
            {/* Cement plug */}
            <motion.rect x={ml + 8} y={mt + totalH - plugPixels - 20} width={pw - 16} height={plugPixels}
                fill="#8b5cf6" opacity="0.6" stroke="#8b5cf6" strokeWidth="1.5" rx="4"
                initial={{ height: 0, y: mt + totalH - 16 }}
                animate={animated ? { height: plugPixels, y: mt + totalH - plugPixels - 20 } : {}}
                transition={{ type: "spring", stiffness: 60, delay: 0.3 }} />
            {/* Pipe ID indicator */}
            <motion.rect x={cx - 14} y={mt + totalH - plugPixels - 18} width={28} height={plugPixels + 10}
                fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4,3" rx="2"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.6 }} />
            {/* Labels */}
            <text x={cx} y={mt + totalH - plugPixels - 25} fill="#8b5cf6" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">{cementVol.toFixed(1)} bbl</text>
            <text x={cx} y={mt + totalH - plugPixels - 13} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">CEMENT</text>
            <text x={cx + 30} y={mt + totalH + 14} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{plugLength.toFixed(0)}′</text>
            <text x={cx} y={mt + 16} fill="#3b82f6" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">{displacementVol.toFixed(1)} bbl</text>
            <text x={cx} y={mt + 28} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DISP VOL</text>
            <text x={w - 16} y={mt + 12} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                ID{wellboreID.toFixed(2)}″
            </text>
        </svg>
    );
}

// ── Cement Job Pressure Chart ──
export function CementJobPressureSVG({
    surfacePressure, bottomPressure, formationPressure, maxAllowablePressure,
    pumpRate, totalVolume
}: {
    surfacePressure: number; bottomPressure: number; formationPressure: number;
    maxAllowablePressure: number; pumpRate: number; totalVolume: number;
}) {
    const w = 300, h = 220, ml = 55, mr = 20, mt = 20, mb = 35;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxP = Math.max(surfacePressure, bottomPressure, maxAllowablePressure, formationPressure) * 1.2;
    const toH = (p: number) => ph - (p / maxP) * ph;
    const cx = ml + pw / 2;
    const barW = 40;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Max allowable limit line */}
            <motion.line x1={ml} y1={mt + toH(maxAllowablePressure)} x2={ml + pw} y2={mt + toH(maxAllowablePressure)}
                stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,3"
                initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.8 }} />
            <text x={ml + pw - 4} y={mt + toH(maxAllowablePressure) - 5} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">MAP {maxAllowablePressure.toFixed(0)}</text>
            {/* Surface Pressure Bar */}
            <motion.rect x={cx - barW - 8} y={mt + toH(surfacePressure)} width={barW} height={ph - toH(surfacePressure)} rx="4"
                fill="#3b82f6" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"
                initial={{ height: 0, y: mt + ph }} animate={{ height: ph - toH(surfacePressure), y: mt + toH(surfacePressure) }}
                transition={{ type: "spring", stiffness: 100 }} />
            <text x={cx - barW / 2 - 8} y={mt + toH(surfacePressure) - 6} fill="#3b82f6" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">{surfacePressure.toFixed(0)}</text>
            <text x={cx - barW / 2 - 8} y={mt + ph + 14} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SURFACE</text>
            {/* Bottom Pressure Bar */}
            <motion.rect x={cx + 8} y={mt + toH(bottomPressure)} width={barW} height={ph - toH(bottomPressure)} rx="4"
                fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7"
                initial={{ height: 0, y: mt + ph }} animate={{ height: ph - toH(bottomPressure), y: mt + toH(bottomPressure) }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }} />
            <text x={cx + barW / 2 + 8} y={mt + toH(bottomPressure) - 6} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">{bottomPressure.toFixed(0)}</text>
            <text x={cx + barW / 2 + 8} y={mt + ph + 14} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">BOTTOM</text>
            {/* Formation Pressure ref */}
            <text x={ml + pw - 4} y={mt + toH(formationPressure) + 3} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">FP {formationPressure.toFixed(0)}</text>
            {/* Rate & Volume indicators */}
            <text x={ml + 40} y={mt + 14} fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="black">{pumpRate.toFixed(1)} bpm</text>
            <text x={ml + 40} y={mt + 26} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">RATE</text>
            <text x={w - 16} y={mt + 14} fill="#8b5cf6" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="end">{totalVolume.toFixed(0)} bbl</text>
            <text x={w - 16} y={mt + 26} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">VOL</text>
        </svg>
    );
}

// ── Cement Bond Log Qual Gauge ──
export function CementBondLogSVG({
    bondIndex, compressiveStrength, waitOnCementHours, topOfCement, isolationQuality
}: {
    bondIndex: number; compressiveStrength: number; waitOnCementHours: number;
    topOfCement: number; isolationQuality: string;
}) {
    const w = 240, h = 260, cx = 120, cy = 145, r = 100;
    const angle = Math.min(270, (bondIndex) * 270);
    const needleX = cx + r * 0.7 * Math.cos(((angle - 135) * Math.PI) / 180);
    const needleY = cy + r * 0.7 * Math.sin(((angle - 135) * Math.PI) / 180);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="cblGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            <circle cx={cx} cy={cy} r={r + 5} fill="url(#cblGlow)" />
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            {/* Color arc zones */}
            {/* Red zone 0-0.4 */}<path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * Math.cos((-27) * Math.PI / 180)} ${cy + r * Math.sin((-27) * Math.PI / 180)}`}
                fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.5" />
            {/* Yellow zone */}<path d={`M ${cx + r * Math.cos((-27) * Math.PI / 180)} ${cy + r * Math.sin((-27) * Math.PI / 180)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos((81) * Math.PI / 180)} ${cy + r * Math.sin((81) * Math.PI / 180)}`}
                fill="none" stroke="#f59e0b" strokeWidth="8" opacity="0.5" />
            {/* Green zone */}<path d={`M ${cx + r * Math.cos((81) * Math.PI / 180)} ${cy + r * Math.sin((81) * Math.PI / 180)} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`}
                fill="none" stroke="#22c55e" strokeWidth="8" opacity="0.5" />
            {/* Needle */}
            <motion.line
                animate={{ x1: cx, y1: cy, x2: needleX, y2: needleY }}
                initial={{ x1: cx, y1: cy, x2: cx + r * 0.7, y2: cy }}
                style={{ stroke: bondIndex > 0.7 ? "#22c55e" : bondIndex > 0.4 ? "#f59e0b" : "#ef4444", strokeWidth: "3", strokeLinecap: "round" }}
                transition={{ type: "spring", stiffness: 70 }} />
            <circle cx={cx} cy={cy} r="5" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <text x={cx} y={cy + 28} fill={bondIndex > 0.7 ? "#22c55e" : "#f59e0b"} fontSize="20" fontFamily="monospace" fontWeight="black" textAnchor="middle">{(bondIndex * 100).toFixed(0)}%</text>
            <text x={cx} y={cy + 44} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">BOND INDEX</text>
            <text x={cx} y={cy - r + 24} fill="#8b5cf6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{isolationQuality}</text>
            <text x={w - 10} y={14} fill="#475569" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">CS {compressiveStrength.toFixed(0)} psi</text>
            <text x={w - 10} y={24} fill="#475569" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">WOC {waitOnCementHours.toFixed(1)} hr</text>
        </svg>
    );
}

// ── Cementing Displacement Efficiency Visualization ──
export function DisplacementEfficiencySVG({
    efficiency, standoff, pumpRate, returnsRate, losses
}: {
    efficiency: number; standoff: number; pumpRate: number; returnsRate: number; losses: number;
}) {
    const w = 240, h = 200, ml = 30, mr = 20, mt = 20, mb = 30;
    const pw = w - ml - mr;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={h - mt - mb} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Efficiency fill bar */}
            <motion.rect x={ml + 10} y={mt + 20} width={pw - 20} height={h - mt - mb - 50} fill="#0f172a" rx="6" stroke="#1e293b" strokeWidth="1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.rect x={ml + 10} y={h - mb - 25} width={(pw - 20) * (efficiency / 100)} height={h - mt - mb - 50} fill="#8b5cf6" rx="6" opacity="0.7"
                initial={{ width: 0 }} animate={animated ? { width: (pw - 20) * (efficiency / 100) } : {}}
                transition={{ type: "spring", stiffness: 60, damping: 10 }} />
            {/* Efficiency percentage */}
            <text x={ml + pw / 2} y={mt + (h - mt - mb) / 2 + 4} fill="white" fontSize="20" fontFamily="monospace" fontWeight="black" textAnchor="middle">{efficiency.toFixed(0)}%</text>
            <text x={ml + pw / 2} y={mt + (h - mt - mb) / 2 + 20} fill="#8b5cf6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DISPLACEMENT</text>
            {/* KPI row */}
            <text x={ml + 14} y={h - 6} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">{standoff.toFixed(0)}% SO</text>
            <text x={ml + pw / 2} y={h - 6} fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{pumpRate.toFixed(1)} bpm</text>
            <text x={ml + pw - 14} y={h - 6} fill="#ef4444" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">{losses > 0 ? `LOSS ${losses.toFixed(0)} bbl` : "NO LOSS"}</text>
        </svg>
    );
}