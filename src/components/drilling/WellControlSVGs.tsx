import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Kick Detection Pressure Gauge ──
export function KickDetectionGaugeSVG({ sidpp, scrp, kmw, currentMW }: { sidpp: number; scrp: number; kmw: number; currentMW: number }) {
    const w = 280, h = 280, cx = 140, cy = 145, r = 110;
    const animate = sidpp > 0;
    const needleAngle = animate ? Math.min(270, (sidpp / 1500) * 270) : 0;
    const needleX = cx + r * 0.75 * Math.cos(((needleAngle - 135) * Math.PI) / 180);
    const needleY = cy + r * 0.75 * Math.sin(((needleAngle - 135) * Math.PI) / 180);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="kcGaugeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <filter id="kcGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            <circle cx={cx} cy={cy} r={r + 5} fill="url(#kcGaugeGlow)" />
            {/* Gauge background */}
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#1e293b" strokeWidth="4" />
            {/* Danger arc */}
            {[225, 255, 285, 315].map((deg, i) => (
                <line key={i} x1={cx + (r - 15) * Math.cos((deg * Math.PI) / 180)} y1={cy + (r - 15) * Math.sin((deg * Math.PI) / 180)}
                    x2={cx + r * Math.cos((deg * Math.PI) / 180)} y2={cy + r * Math.sin((deg * Math.PI) / 180)}
                    stroke={i > 1 ? "#ef4444" : "#f59e0b"} strokeWidth="3" strokeLinecap="round" />
            ))}
            {/* Tick marks */}
            {Array.from({ length: 13 }, (_, i) => {
                const angle = (i * 22.5 - 135) * Math.PI / 180;
                const innerX = cx + (r - 12) * Math.cos(angle);
                const innerY = cy + (r - 12) * Math.sin(angle);
                const outerX = cx + r * Math.cos(angle);
                const outerY = cy + r * Math.sin(angle);
                return (
                    <line key={i} x1={innerX} y1={innerY} x2={outerX} y2={outerY} stroke={i >= 10 ? "#ef4444" : "#64748b"} strokeWidth="2" strokeLinecap="round" />
                );
            })}
            {/* Labels */}
            <text x={cx - r + 15} y={cy + 20} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">0</text>
            <text x={cx + r - 15} y={cy + 20} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">1500</text>
            <text x={cx} y={cy - r + 18} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">750</text>
            {/* Animated needle */}
            <motion.line
                animate={{ x1: cx, y1: cy, x2: needleX, y2: needleY }}
                initial={{ x1: cx, y1: cy, x2: cx + r * 0.75, y2: cy }}
                style={{ stroke: animate ? "#f43f5e" : "#64748b", strokeWidth: "2.5", strokeLinecap: "round" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                filter={animate ? "url(#kcGlow)" : ""}
            />
            <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="3" fill={animate ? "#f43f5e" : "#64748b"} />
            {/* Center text */}
            <text x={cx} y={cy + 40} fill={animate ? "#f43f5e" : "#64748b"} fontSize="11" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {animate ? "KICK!" : "NORMAL"}
            </text>
            <text x={cx} y={cy + 54} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle" style={{ textTransform: "uppercase" }}>
                SIDPP: {sidpp.toFixed(0)} psi
            </text>
        </svg>
    );
}

// ── Kill Sheet Step Chart ──
export function KillSheetChartSVG({ icp, fcp, scrp, strokes }: { icp: number; fcp: number; scrp: number; strokes: number[] }) {
    const w = 420, h = 240, ml = 55, mr = 20, mt = 25, mb = 35;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxP = Math.max(icp, fcp, scrp) * 1.15;
    const maxS = strokes.length > 0 ? Math.max(...strokes) * 1.05 : 2000;
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 600);
        return () => clearTimeout(t);
    }, []);

    const toX = (v: number) => ml + (v / maxS) * pw;
    const toY = (v: number) => mt + ph - (v / maxP) * ph;

    const schedule = strokes.map((s, i) => ({
        x: toX(s),
        y: toY(icp - ((icp - fcp) * s) / strokes[strokes.length - 1]),
        stroke: s
    }));

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="killGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                </linearGradient>
            </defs>
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1.5" />
            <rect x={ml} y={mt} width={pw} height={ph} fill="url(#killGrad)" rx="8" />
            {/* Grid */}
            {Array.from({ length: 5 }, (_, i) => {
                const y = mt + (i / 4) * ph;
                const px = maxP - (i / 4) * maxP;
                return (
                    <React.Fragment key={i}>
                        <line x1={ml} y1={y} x2={ml + pw} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={ml - 6} y={y + 3} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end" fontWeight="bold">
                            {px.toFixed(0)}
                        </text>
                    </React.Fragment>
                );
            })}
            {Array.from({ length: 5 }, (_, i) => {
                const x = ml + (i / 4) * pw;
                const sx = (i / 4) * maxS;
                return (
                    <React.Fragment key={i}>
                        <line x1={x} y1={mt} x2={x} y2={mt + ph} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={x} y={mt + ph + 15} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                            {sx.toFixed(0)}
                        </text>
                    </React.Fragment>
                );
            })}
            {/* ICP line */}
            <line x1={ml} y1={toY(icp)} x2={ml + pw} y2={toY(icp)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="6,4" opacity="0.6" />
            <text x={ml + pw - 4} y={toY(icp) - 5} fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">ICP</text>
            {/* FCP line */}
            <line x1={ml} y1={toY(fcp)} x2={ml + pw} y2={toY(fcp)} stroke="#22c55e" strokeWidth="1" strokeDasharray="6,4" opacity="0.6" />
            <text x={ml + pw - 4} y={toY(fcp) - 5} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">FCP</text>
            {/* Kill schedule polyline */}
            <motion.polyline
                points={schedule.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                filter="url(#kcGlow)"
            />
            {/* Data points */}
            {schedule.map((p, i) => (
                <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b"
                    initial={{ scale: 0 }} animate={animated ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring" }} />
            ))}
            {/* Axis labels */}
            <text x={ml + pw / 2} y={h - 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STROKES</text>
            <text x={12} y={mt + ph / 2} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" transform={`rotate(-90,12,${mt + ph / 2})`}>PRESSURE (psi)</text>
        </svg>
    );
}

// ── BOP Stack Schematic ──
export function BOPStackSVG({ masp, testPressure }: { masp: number; testPressure: number }) {
    const w = 180, h = 350;
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 1200);
        return () => clearInterval(interval);
    }, []);

    const components = [
        { label: "ANNULAR", color: "#f59e0b", y: 40, h: 30, active: true },
        { label: "BOP RAM", color: "#ef4444", y: 80, h: 28, active: true },
        { label: "SHEAR RAM", color: "#dc2626", y: 118, h: 28, active: true },
        { label: "PIPE RAM", color: "#ef4444", y: 156, h: 28, active: true },
        { label: "CHOKE LINE", color: "#3b82f6", y: 198, h: 22, active: true },
        { label: "KILL LINE", color: "#22c55e", y: 230, h: 22, active: true },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="bopBody" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="30%" stopColor="#334155" />
                    <stop offset="70%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <filter id="bopGlow">
                    <feGaussianBlur stdDeviation="2" />
                </filter>
            </defs>
            {/* Wellhead top */}
            <rect x={w / 2 - 40} y={10} width={80} height={20} rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <text x={w / 2} y={24} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">WELLHEAD</text>
            {/* Main stack body */}
            <rect x={w / 2 - 35} y={30} width={70} height={240} fill="url(#bopBody)" stroke="#334155" strokeWidth="2" rx="6" />
            {/* BOP Components */}
            {components.map((comp, i) => (
                <g key={i}>
                    <rect x={w / 2 - 45} y={comp.y} width={90} height={comp.h} rx="4"
                        fill={comp.color + "15"} stroke={comp.color} strokeWidth="1.5" />
                    <motion.circle cx={w / 2 - 38} cy={comp.y + comp.h / 2} r="4" fill={comp.color}
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
                    <text x={w / 2} y={comp.y + comp.h / 2 + 3} fill={comp.color} fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                        {comp.label}
                    </text>
                </g>
            ))}
            {/* Pressure indicator */}
            <rect x={w / 2 - 40} y={285} width={80} height={35} rx="6" fill="#0f172a" stroke={pulse ? "#ef4444" : "#1e293b"} strokeWidth="2" />
            <text x={w / 2} y={300} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MASP</text>
            <text x={w / 2} y={313} fill={pulse ? "#ef4444" : "#22c55e"} fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {masp.toFixed(0)} psi
            </text>
            {/* Gas bubble indicator */}
            <motion.circle cx={w / 2} cy={330} r="5" fill="#facc15"
                animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }} />
            <text x={w / 2} y={348} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">GAS MIGRATION</text>
        </svg>
    );
}

// ── Kill Mud Weight Comparison ──
export function KillMudComparatorSVG({ kmw, currentMW, hydrostatic, formationPressure }: { kmw: number; currentMW: number; hydrostatic: number; formationPressure: number }) {
    const w = 320, h = 200, ml = 45, mb = 40, mt = 20, mr = 10;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxVal = Math.max(hydrostatic, formationPressure, formationPressure * 1.1) * 1.15;
    const barW = 55, gap = 25;
    const centerX = ml + pw / 2;

    const bars = [
        { label: "HYDRO. (ORIG)", value: hydrostatic, color: "#3b82f6", x: centerX - barW - gap / 2 },
        { label: "PORE PRESSURE", value: formationPressure, color: "#ef4444", x: centerX + gap / 2 },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Baseline */}
            <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#334155" strokeWidth="1" />
            {/* Bars */}
            {bars.map((bar, i) => {
                const bh = (bar.value / maxVal) * ph;
                return (
                    <g key={i}>
                        <motion.rect x={bar.x} y={mt + ph - bh} width={barW} height={bh} rx="6"
                            fill={bar.color + "20"} stroke={bar.color} strokeWidth="1.5"
                            initial={{ height: 0, y: mt + ph }}
                            animate={{ height: bh, y: mt + ph - bh }}
                            transition={{ duration: 1.2, delay: i * 0.25, type: "spring", stiffness: 60 }} />
                        <text x={bar.x + barW / 2} y={mt + ph - bh - 6} fill={bar.color} fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                            {bar.value.toFixed(0)}
                        </text>
                        <text x={bar.x + barW / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                            {bar.label}
                        </text>
                    </g>
                );
            })}
            {/* KMW callout */}
            {hydrostatic < formationPressure && (
                <g>
                    <motion.line x1={ml} y1={mt + ph - (formationPressure / maxVal) * ph} x2={ml + pw} y2={mt + ph - (formationPressure / maxVal) * ph}
                        stroke="#f43f5e" strokeWidth="1" strokeDasharray="5,3"
                        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.5 }} />
                    <motion.text x={ml + pw} y={mt + ph - (formationPressure / maxVal) * ph - 6} fill="#f43f5e"
                        fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="end"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                        KMW: {kmw.toFixed(1)} ppg
                    </motion.text>
                </g>
            )}
            <text x={ml + pw / 2} y={h - 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PRESSURE (psi)</text>
        </svg>
    );
};