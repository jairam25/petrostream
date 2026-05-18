import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// ── Marsh Funnel Viscometer Animation ──
export function MarshFunnelSVG({ funnelViscosity, density }: { funnelViscosity: number; density: number }) {
    const w = 200, h = 300;
    const [flowing, setFlowing] = useState(false);
    useEffect(() => { const t = setTimeout(() => setFlowing(true), 400); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="mudGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a16207" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#854d0e" stopOpacity="0.9" />
                </linearGradient>
                <filter id="mudGlow"><feGaussianBlur stdDeviation="2" /></filter>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            {/* Funnel body */}
            <path d={`M ${w / 2 - 50} 40 L ${w / 2 - 15} 160 L ${w / 2 + 15} 160 L ${w / 2 + 50} 40 Z`} fill="url(#mudGrad)" stroke="#a16207" strokeWidth="2" />
            {/* Funnel rim */}
            <rect x={w / 2 - 55} y={22} width={110} height={18} rx="4" fill="#1e293b" stroke="#a16207" strokeWidth="2" />
            {/* Funnel stem */}
            <rect x={w / 2 - 5} y={160} width={10} height={50} fill="#854d0e" stroke="#a16207" strokeWidth="1.5" />
            {/* Orifice */}
            <rect x={w / 2 - 3} y={210} width={6} height={8} fill="#1e293b" stroke="#a16207" strokeWidth="1" />
            {/* Flowing mud drops */}
            {[0, 1, 2, 3].map(i => (
                <motion.ellipse key={i} cx={w / 2 + (i - 1.5) * 3} cy={225} rx="3" ry="5" fill="#a16207"
                    animate={flowing ? { cy: [225, 265, 225], opacity: [0.8, 0.2, 0.8], rx: [3, 1.5, 3], ry: [5, 7, 5] } : {}}
                    transition={{ duration: 1.2 + i * 0.25, repeat: Infinity, delay: i * 0.3 }} />
            ))}
            {/* Collection cup */}
            <rect x={w / 2 - 25} y={240} width={50} height={40} rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <text x={w / 2} y={265} fill="#a16207" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {funnelViscosity.toFixed(1)}s
            </text>
            <text x={w / 2} y={292} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                MARSH FUNNEL
            </text>
        </svg>
    );
}

// ── Mud Weight Balance ──
export function MudBalanceSVG({ currentMW, targetMW, formationPressure, depth }: { currentMW: number; targetMW: number; formationPressure: number; depth: number }) {
    const w = 300, h = 220;
    const barW = 50, barH = 130, startY = 30, ml = 25, mr = 25;
    const pw = w - ml - mr;
    const maxV = Math.max(currentMW, targetMW, formationPressure / (0.052 * depth + 1e-6)) * 1.3;
    const centerX = ml + pw / 2;
    const toH = (v: number) => (v / maxV) * barH;

    const bars = [
        { label: "ORIG MW", value: currentMW, color: "#3b82f6", x: centerX - barW - 15 },
        { label: "TGT MW", value: targetMW, color: "#22c55e", x: centerX },
        { label: "Pp EMW", value: formationPressure / (0.052 * depth + 1e-6), color: "#ef4444", x: centerX + barW + 15 },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <text x={w / 2} y={18} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">MUD WEIGHT (ppg)</text>
            <line x1={ml} y1={startY + barH} x2={ml + pw} y2={startY + barH} stroke="#334155" strokeWidth="1" />
            {bars.map((bar, i) => (
                <g key={i}>
                    <motion.rect x={bar.x - barW / 2} y={startY + barH - toH(bar.value)} width={barW} height={toH(bar.value)} rx="6"
                        fill={bar.color + "20"} stroke={bar.color} strokeWidth="1.5"
                        initial={{ height: 0, y: startY + barH }}
                        animate={{ height: toH(bar.value), y: startY + barH - toH(bar.value) }}
                        transition={{ duration: 1, delay: i * 0.3, type: "spring", stiffness: 50 }} />
                    <text x={bar.x} y={startY + barH - toH(bar.value) - 5} fill={bar.color} fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                        {bar.value.toFixed(1)}
                    </text>
                    <text x={bar.x} y={startY + barH + 18} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {bar.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

// ── Solid Control Shale Shaker Animation ──
export function ShaleShakerSVG({ solidsPct, cutPoint }: { solidsPct: number; cutPoint: number }) {
    const w = 320, h = 180;
    const [vibrating, setVibrating] = useState(false);
    useEffect(() => { setVibrating(true); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="shakerMud" x1="0" y1="1" x2="1" y2="1">
                    <stop offset="0%" stopColor="#713f12" />
                    <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
            </defs>
            <rect width={w} height={h} fill="transparent" />
            {/* Shaker frame */}
            <motion.rect x={30} y={80} width={240} height={20} rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"
                animate={vibrating ? { x: [30, 32, 28, 30] } : {}} transition={{ duration: 0.15, repeat: Infinity }} />
            {/* Vibrator motor */}
            <motion.circle cx={270} cy={90} r="12" fill="#334155" stroke="#f59e0b" strokeWidth="2"
                animate={vibrating ? { rotate: [0, 15, -15, 0] } : {}} transition={{ duration: 0.3, repeat: Infinity }} />
            {/* Screen mesh */}
            <motion.rect x={40} y={95} width={200} height={4} rx="1" fill="#475569"
                animate={vibrating ? { x: [40, 42, 38, 40] } : {}} transition={{ duration: 0.15, repeat: Infinity }} />
            {/* Falling solids */}
            {Array.from({ length: 8 }, (_, i) => (
                <motion.circle key={i} cx={60 + i * 25} cy={105 + (i % 2) * 10} r="3" fill="#713f12"
                    animate={{ cy: [105 + (i % 2) * 10, 140, 105 + (i % 2) * 10], opacity: [0.9, 0.3, 0.9] }}
                    transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
            ))}
            {/* Overflow mud */}
            <motion.rect x={40} y={75} width={150} height={8} rx="3" fill="url(#shakerMud)"
                animate={{ x: [40, 42, 38, 40] }} transition={{ duration: 0.15, repeat: Infinity }} />
            {/* Labels */}
            <text x={w / 2} y={25} fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {solidsPct.toFixed(1)}%
            </text>
            <text x={w / 2} y={38} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                LOW-GRAVITY SOLIDS
            </text>
            <text x={w / 2} y={160} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                CUT POINT: {cutPoint.toFixed(0)} μm
            </text>
            <text x={w / 2} y={172} fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle">
                SHAKER • DESANDER • DESILTER
            </text>
        </svg>
    );
}

// ── Bingham Plastic Rheogram ──
export function RheogramSVG({
    theta300, theta600, pv, yp, model
}: { theta300: number; theta600: number; pv: number; yp: number; model: "bingham" | "power-law" }) {
    const w = 340, h = 240, ml = 55, mr = 15, mt = 25, mb = 40;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxRPM = 700, maxTau = Math.max(theta600, theta300 * 2, yp * 2.5) * 1.2;
    const toX = (v: number) => ml + (v / maxRPM) * pw;
    const toY = (v: number) => mt + ph - (v / maxTau) * ph;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
            {/* Grid */}
            {Array.from({ length: 5 }, (_, i) => {
                const y = mt + (i / 4) * ph;
                return <line key={i} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
                const x = ml + (i / 4) * pw;
                return <line key={i} x1={x} y1={mt} x2={x} y2={mt + ph} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
            })}
            {/* Bingham model line */}
            <motion.line x1={toX(0)} y1={toY(yp)} x2={toX(600)} y2={toY(theta600)}
                stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }} />
            {/* Data points */}
            <motion.circle cx={toX(300)} cy={toY(theta300)} r="5" fill="#3b82f6"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} />
            <motion.circle cx={toX(600)} cy={toY(theta600)} r="5" fill="#22c55e"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }} />
            {/* Labels */}
            <text x={toX(300) + 10} y={toY(theta300) - 8} fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold">{theta300.toFixed(0)}</text>
            <text x={toX(600) + 10} y={toY(theta600) - 8} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold">{theta600.toFixed(0)}</text>
            {/* YP intercept */}
            <circle cx={toX(0)} cy={toY(yp)} r="4" fill="#ef4444" />
            <text x={toX(0) + 8} y={toY(yp) - 6} fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">YP:{yp.toFixed(0)}</text>
            {/* Axes */}
            <text x={ml + pw / 2} y={mt + ph + 18} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RPM</text>
            <text x={12} y={mt + ph / 2} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" transform={`rotate(-90,12,${mt + ph / 2})`}>τ (lbf/100ft²)</text>
            <text x={ml + pw - 10} y={mt + 14} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="end">
                PV: {pv.toFixed(0)} cP
            </text>
        </svg>
    );
}