import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// ── ECD vs Depth Profile ──
export function ECDProfileSVG({
    depths, ecdValues, porePressureEMW, fractureEMW, currentMW
}: { depths: number[]; ecdValues: number[]; porePressureEMW: number; fractureEMW: number; currentMW: number }) {
    const w = 320, h = 380, ml = 60, mr = 20, mt = 30, mb = 35;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxDepth = depths.length > 0 ? Math.max(...depths) * 1.05 : 15000;
    const ppgMin = Math.min(currentMW * 0.85, porePressureEMW * 0.9);
    const ppgMax = Math.max(fractureEMW * 1.1, currentMW * 1.3);
    const toY = (d: number) => mt + (d / maxDepth) * ph;
    const toX = (ppg: number) => ml + ((ppg - ppgMin) / (ppgMax - ppgMin)) * pw;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="windowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#22c55e" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.08" />
                </linearGradient>
            </defs>
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            <rect x={ml} y={mt} width={pw} height={ph} fill="url(#windowGrad)" rx="8" />
            {/* Grid lines */}
            {[porePressureEMW, fractureEMW, currentMW].map((v, i) => (
                <React.Fragment key={i}>
                    <line x1={toX(v)} y1={mt} x2={toX(v)} y2={mt + ph} stroke={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#3b82f6"} strokeWidth="1" strokeDasharray={i === 1 ? "6,3" : "3,3"} opacity="0.5" />
                </React.Fragment>
            ))}
            {/* ECD polyline */}
            {depths.length > 1 && (
                <motion.polyline
                    points={depths.map((d, i) => `${toX(ecdValues[i] || currentMW)},${toY(d)}`).join(" ")}
                    fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            )}
            {/* Depth labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
                <text key={f} x={ml - 6} y={mt + f * ph + 3} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end" fontWeight="bold">
                    {(maxDepth * (1 - f)).toFixed(0)}
                </text>
            ))}
            {/* Legend */}
            <circle cx={ml + 12} cy={mt + 10} r="4" fill="#ef4444" opacity="0.8" />
            <text x={ml + 20} y={mt + 13} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">Pp EMW</text>
            <circle cx={ml + 12} cy={mt + 22} r="4" fill="#22c55e" opacity="0.8" />
            <text x={ml + 20} y={mt + 25} fill="#22c55e" fontSize="7" fontFamily="monospace" fontWeight="bold">ECD</text>
            <text x={ml + pw / 2} y={h - 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">EMW (ppg)</text>
        </svg>
    );
}

// ── Hydraulic Horsepower Gauge ──
export function HydraulicHPGaugeSVG({ hp, jetImpactForce, nozzleVelocity, bitTFA }: { hp: number; jetImpactForce: number; nozzleVelocity: number; bitTFA: number }) {
    const w = 240, h = 240, cx = 120, cy = 135, r = 100;
    const maxHP = 3000;
    const angle = Math.min(270, (hp / maxHP) * 270);
    const needleX = cx + r * 0.7 * Math.cos(((angle - 135) * Math.PI) / 180);
    const needleY = cy + r * 0.7 * Math.sin(((angle - 135) * Math.PI) / 180);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="hpGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </radialGradient>
                <filter id="hpFilter"><feGaussianBlur stdDeviation="2" /></filter>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            <circle cx={cx} cy={cy} r={r + 5} fill="url(#hpGlow)" />
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            {/* HP tick marks */}
            {Array.from({ length: 11 }, (_, i) => {
                const deg = i * 27 - 135;
                const rad = (deg * Math.PI) / 180;
                return (
                    <line key={i} x1={cx + (r - 10) * Math.cos(rad)} y1={cy + (r - 10) * Math.sin(rad)}
                        x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
                        stroke={i >= 8 ? "#ef4444" : "#475569"} strokeWidth={i % 2 === 0 ? "2.5" : "1.5"} strokeLinecap="round" />
                );
            })}
            {/* Needle */}
            <motion.line
                animate={{ x1: cx, y1: cy, x2: needleX, y2: needleY }}
                initial={{ x1: cx, y1: cy, x2: cx + r * 0.7, y2: cy }}
                style={{ stroke: hp > 2000 ? "#ef4444" : "#22c55e", strokeWidth: "2.5", strokeLinecap: "round" }}
                transition={{ type: "spring", stiffness: 70, damping: 10 }}
                filter={hp > 2000 ? "url(#hpFilter)" : ""}
            />
            <circle cx={cx} cy={cy} r="5" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <text x={cx} y={cy + 32} fill={hp > 2000 ? "#ef4444" : "#22c55e"} fontSize="18" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {hp.toFixed(0)}
            </text>
            <text x={cx} y={cy + 48} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">HHP</text>
            <text x={cx - r + 12} y={cy + 20} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold">0</text>
            <text x={cx + r - 12} y={cy + 20} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">3000</text>
            <text x={cx} y={cy - r + 18} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">1500</text>
        </svg>
    );
}

// ── Annular Pressure Loss Pie ──
export function AnnularLossPieSVG({
    surfaceLoss, pipeLoss, annulusLoss, bitLoss, topDriveLoss
}: { surfaceLoss: number; pipeLoss: number; annulusLoss: number; bitLoss: number; topDriveLoss: number }) {
    const w = 260, h = 240, cx = 130, cy = 120, r = 85;
    const total = surfaceLoss + pipeLoss + annulusLoss + bitLoss + topDriveLoss || 1;
    const segments = [
        { name: "SURFACE", value: surfaceLoss, color: "#6366f1" },
        { name: "PIPE", value: pipeLoss, color: "#3b82f6" },
        { name: "ANNULUS", value: annulusLoss, color: "#f59e0b" },
        { name: "BIT", value: bitLoss, color: "#ef4444" },
        { name: "TOP DRIVE", value: topDriveLoss, color: "#8b5cf6" },
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
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }} />
                );
            })}
            <circle cx={cx} cy={cy} r={r * 0.5} fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <text x={cx} y={cy - 2} fill="#22c55e" fontSize="15" fontFamily="monospace" fontWeight="black" textAnchor="middle">{total.toFixed(0)}</text>
            <text x={cx} y={cy + 14} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TOTAL PSI</text>
            {/* Legend */}
            {segments.map((s, i) => (
                <g key={s.name}>
                    <rect x={20} y={190 + i * 12} width={8} height={8} rx="2" fill={s.color + "60"} />
                    <text x={32} y={197 + i * 12} fill={s.color} fontSize="6" fontFamily="monospace" fontWeight="bold">{s.name}</text>
                    <text x={130} y={197 + i * 12} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="end">{s.value.toFixed(0)}</text>
                    <text x={135} y={197 + i * 12} fill="#475569" fontSize="6" fontFamily="monospace">{((s.value / total) * 100).toFixed(0)}%</text>
                </g>
            ))}
        </svg>
    );
}

// ── Jet Nozzle Flow Animation ──
export function JetNozzleSVG({ nozzleVelocity, bitTFA, numberOfNozzles }: { nozzleVelocity: number; bitTFA: number; numberOfNozzles: number }) {
    const w = 240, h = 180;
    const [flowing, setFlowing] = useState(false);
    useEffect(() => { setFlowing(true); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="jetFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            {/* Bit body */}
            <path d={`M ${w / 2 - 40} 20 L ${w / 2 - 15} 60 L ${w / 2 + 15} 60 L ${w / 2 + 40} 20 Z`} fill="#1e293b" stroke="#334155" strokeWidth="2" />
            {/* Nozzles */}
            {[0, 1, 2].map((_, i) => (
                <g key={i}>
                    <rect x={w / 2 - 18 + i * 18} y={55} width={8} height={18} rx="3" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
                    {/* Jet stream */}
                    <motion.path d={`M ${w / 2 - 14 + i * 18} 73 L ${w / 2 - 14 + i * 18 + (i - 1) * 8} 150`}
                        stroke="url(#jetFlow)" strokeWidth={3 + i} fill="none"
                        animate={flowing ? { opacity: [0.3, 1, 0.3] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                </g>
            ))}
            {/* Velocity display */}
            <text x={w / 2} y={35} fill="#22c55e" fontSize="14" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {nozzleVelocity.toFixed(0)} ft/s
            </text>
            <text x={w / 2} y={48} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                NOZZLE VELOCITY
            </text>
            <text x={w / 2} y={170} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                TFA: {bitTFA.toFixed(3)} in² • {numberOfNozzles} Jets
            </text>
        </svg>
    );
}

// ── Equivalent Circulating Density Line Chart ──
export function ECDPressureSVG({
    staticMW, ecd, frictionalLoss, depth
}: { staticMW: number; ecd: number; frictionalLoss: number; depth: number }) {
    const w = 300, h = 200, ml = 50, mr = 15, mt = 20, mb = 35;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxVal = Math.max(ecd, staticMW * 1.3) * 1.1;
    const centerX = ml + pw / 2;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="6" stroke="#1e293b" strokeWidth="1" />
            <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#334155" strokeWidth="1" />
            {/* Static MW bar */}
            <motion.rect x={centerX - 30} y={mt + ph - (staticMW / maxVal) * ph} width={25} height={(staticMW / maxVal) * ph} rx="4"
                fill="#3b82f6" stroke="#3b82f6" strokeWidth="1.5"
                initial={{ height: 0, y: mt + ph }} animate={{ height: (staticMW / maxVal) * ph, y: mt + ph - (staticMW / maxVal) * ph }}
                transition={{ duration: 0.8, type: "spring" }} />
            {/* ECD bar with frictional addition */}
            <motion.rect x={centerX + 5} y={mt + ph - (staticMW / maxVal) * ph} width={25} height={(staticMW / maxVal) * ph} rx="4"
                fill="#22c55e40" stroke="#22c55e" strokeWidth="1.5"
                initial={{ height: 0, y: mt + ph }} animate={{ height: (staticMW / maxVal) * ph, y: mt + ph - (staticMW / maxVal) * ph }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }} />
            {/* Frictional loss adder */}
            <motion.rect x={centerX + 5} y={mt + ph - (ecd / maxVal) * ph} width={25} height={((ecd - staticMW) / maxVal) * ph} rx="4"
                fill="#ef4444" stroke="#ef4444" strokeWidth="1.5"
                initial={{ height: 0, y: mt + ph - (staticMW / maxVal) * ph }}
                animate={{ height: ((ecd - staticMW) / maxVal) * ph, y: mt + ph - (ecd / maxVal) * ph }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring" }} />
            {/* Labels */}
            <text x={centerX - 17} y={mt + ph - (staticMW / maxVal) * ph - 5} fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{staticMW.toFixed(1)}</text>
            <text x={centerX + 17} y={mt + ph - (ecd / maxVal) * ph - 5} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{ecd.toFixed(1)}</text>
            <text x={centerX} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">EMW (ppg)</text>
            <text x={w - 10} y={mt + 12} fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">ΔP: {frictionalLoss.toFixed(0)}</text>
        </svg>
    );
}