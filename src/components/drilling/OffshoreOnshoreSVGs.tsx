import React from "react";
import { motion } from "motion/react";

// 1. OFFSHORE RIG WITH WAVE ANIMATION
export function OffshoreRigSVG({ waterDepth = 7500, rigType = "Semi-Submersible" }: { waterDepth?: number; rigType?: string }) {
    const h = 380;
    const w = 400;
    const cx = w / 2;
    const seaLevelY = 100;
    const mudlineY = 290;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#082f49" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#02050a" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.2" />
                </linearGradient>
                <filter id="rigGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="14" />

            {/* Sky */}
            <rect x={0} y={0} width={w} height={seaLevelY} fill="url(#skyGrad)" />

            {/* Stars */}
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.circle
                    key={`s${i}`}
                    cx={20 + (i * 27) % 380} cy={15 + ((i * 13) % 70)}
                    r={0.8 + Math.random() * 1.5}
                    fill="#94a3b8"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
                />
            ))}

            {/* Sea Level */}
            <motion.line
                x1={0} y1={seaLevelY} x2={w} y2={seaLevelY}
                stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4"
                animate={{ y1: [seaLevelY, seaLevelY + 2, seaLevelY], y2: [seaLevelY, seaLevelY + 2, seaLevelY] }}
                transition={{ repeat: Infinity, duration: 3 }}
            />
            <text x={w - 10} y={seaLevelY - 5} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="end">MSL</text>

            {/* Water Column */}
            <rect x={cx - 3} y={seaLevelY} width={6} height={mudlineY - seaLevelY} fill="url(#seaGrad)" rx="2" />

            {/* Wave particles */}
            {Array.from({ length: 18 }).map((_, i) => (
                <motion.circle
                    key={`wp${i}`}
                    cx={cx + (Math.sin(i * 1.3) * 80)}
                    cy={seaLevelY + 10 + (i * 12)}
                    r={1.5}
                    fill="#38bdf8"
                    fillOpacity={0.3}
                    animate={{
                        cy: [seaLevelY + 10 + (i * 12) + Math.sin(Date.now() * 0.001 + i) * 5],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.2, delay: i * 0.12 }}
                />
            ))}

            {/* Semi-Submersible Rig */}
            <g transform={`translate(${cx - 40}, ${seaLevelY - 35})`}>
                {/* Deck */}
                <rect x={0} y={0} width={80} height={15} rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" filter="url(#rigGlow)" />
                {/* Derrick */}
                <rect x={30} y={-45} width={20} height={45} rx="2" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                <rect x={25} y={-60} width={30} height={17} rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.8" />
                <text x={40} y={-48} fill="#fbbf24" fontSize="5" fontFamily="monospace" textAnchor="middle">DERRICK</text>

                {/* Helipad */}
                <circle cx={10} cy={7} r={8} fill="#334155" stroke="#475569" strokeWidth="0.8" />
                <text x={10} y={9} fill="#94a3b8" fontSize="4" fontFamily="monospace" textAnchor="middle">H</text>

                {/* Crane */}
                <line x1={75} y1={7} x2={85} y2={-30} stroke="#475569" strokeWidth="1.5" />
                <line x1={80} y1={-30} x2={90} y2={-30} stroke="#475569" strokeWidth="1.5" />

                {/* Columns */}
                <rect x={5} y={15} width={10} height={25} rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
                <rect x={65} y={15} width={10} height={25} rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />

                {/* Pontoon */}
                <rect x={-5} y={40} width={90} height={12} rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="0.8" />
                <text x={40} y={48} fill="#22d3ee" fontSize="4" fontFamily="monospace" textAnchor="middle">PONTOON</text>
            </g>

            {/* Derrick pulsing light */}
            <motion.circle
                cx={cx} cy={seaLevelY - 85}
                r={3}
                fill="#ef4444"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            />

            {/* Mudline */}
            <line x1={10} y1={mudlineY} x2={w - 10} y2={mudlineY} stroke="#92400e" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x={w - 15} y={mudlineY - 5} fill="#a16207" fontSize="7" fontFamily="monospace" textAnchor="end">MUDLINE</text>

            {/* Wellhead at mudline */}
            <rect x={cx - 8} y={mudlineY} width={16} height={10} rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.8" />
            <motion.circle cx={cx} cy={mudlineY + 5} r={3} fill="#f59e0b"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Depth label */}
            <text x={cx + 70} y={seaLevelY + 80} fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                DEPTH: {waterDepth.toLocaleString()} ft
            </text>

            {/* Anchor lines */}
            <line x1={cx - 30} y1={seaLevelY + 15} x2={cx - 100} y2={mudlineY - 30} stroke="#64748b" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,2" />
            <line x1={cx + 30} y1={seaLevelY + 15} x2={cx + 100} y2={mudlineY - 30} stroke="#64748b" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4,2" />

            {/* Legend */}
            <g transform={`translate(20, ${mudlineY + 50})`}>
                <motion.circle cx={0} cy={0} r={3} fill="#ef4444"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Obstruction Light (Live)</text>
            </g>
            <g transform={`translate(20, ${mudlineY + 65})`}>
                <motion.circle cx={0} cy={0} r={3} fill="#38bdf8"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Wave Motion Active</text>
            </g>
        </svg>
    );
}

// 2. ONSHORE LAND RIG ANIMATION
export function OnshoreRigSVG({ rigType = "Mechanical", depth = 12000 }: { rigType?: string; depth?: number }) {
    const h = 350;
    const w = 400;
    const cx = w / 2;
    const groundY = 260;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#78350f" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#451a03" stopOpacity="0.6" />
                </linearGradient>
                <filter id="derrickFilter">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="14" />

            {/* Sky */}
            <rect x={0} y={0} width={w} height={groundY} fill="#020709" />

            {/* Ground */}
            <rect x={0} y={groundY} width={w} height={h - groundY} fill="url(#groundGrad)" />
            <line x1={0} y1={groundY} x2={w} y2={groundY} stroke="#92400e" strokeWidth="2" />
            <text x={w - 10} y={groundY - 5} fill="#a16207" fontSize="8" fontFamily="monospace" textAnchor="end">GRADE</text>

            {/* Rig Sub-structure / Skid */}
            <rect x={cx - 70} y={groundY - 15} width={140} height={15} rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x={cx} y={groundY - 3} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">SUB-STRUCTURE</text>

            {/* Derrick */}
            <motion.g
                animate={{ filter: ["drop-shadow(0 0 2px #f59e0b22)", "drop-shadow(0 0 6px #f59e0b11)", "drop-shadow(0 0 2px #f59e0b22)"] }}
                transition={{ repeat: Infinity, duration: 3 }}
            >
                {/* Derrick legs */}
                <line x1={cx - 35} y1={groundY - 15} x2={cx - 8} y2={groundY - 180} stroke="#64748b" strokeWidth="2.5" />
                <line x1={cx + 35} y1={groundY - 15} x2={cx + 8} y2={groundY - 180} stroke="#64748b" strokeWidth="2.5" />
                <line x1={cx - 8} y1={groundY - 180} x2={cx + 8} y2={groundY - 180} stroke="#64748b" strokeWidth="2" />
                {/* Horizontal braces */}
                {[40, 80, 120, 155].map((h, i) => {
                    const y = groundY - 15 - h;
                    const leftX = cx - 35 + (h / 165) * 27;
                    const rightX = cx + 35 - (h / 165) * 27;
                    return (
                        <line key={i} x1={leftX} y1={y} x2={rightX} y2={y} stroke="#64748b" strokeWidth="1" strokeOpacity="0.5" />
                    );
                })}
                {/* Cross braces */}
                {[60, 100, 140].map((h, i) => {
                    const y1 = groundY - 15 - h + 15;
                    const y2 = groundY - 15 - h;
                    const lx1 = cx - 35 + ((h - 15) / 165) * 27;
                    const rx1 = cx + 35 - ((h - 15) / 165) * 27;
                    const lx2 = cx - 35 + (h / 165) * 27;
                    const rx2 = cx + 35 - (h / 165) * 27;
                    return (
                        <g key={`cross${i}`}>
                            <line x1={lx1} y1={y1} x2={rx2} y2={y2} stroke="#475569" strokeWidth="0.8" />
                            <line x1={rx1} y1={y1} x2={lx2} y2={y2} stroke="#475569" strokeWidth="0.8" />
                        </g>
                    );
                })}
            </motion.g>

            {/* Crown Block */}
            <rect x={cx - 15} y={groundY - 195} width={30} height={18} rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" filter="url(#derrickFilter)" />
            <text x={cx} y={groundY - 183} fill="#fbbf24" fontSize="5" fontFamily="monospace" textAnchor="middle">CROWN</text>

            {/* Traveling Block */}
            <motion.rect
                x={cx - 12} y={groundY - 120} width={24} height={16} rx="3"
                fill="#334155" stroke="#22d3ee" strokeWidth="1.2"
                animate={{ y: [groundY - 120, groundY - 100, groundY - 130, groundY - 120] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
            <text x={cx} y={groundY - 110} fill="#22d3ee" fontSize="5" fontFamily="monospace" textAnchor="middle">T-BLOCK</text>

            {/* Drilling line */}
            <motion.line
                x1={cx} y1={groundY - 177} x2={cx} y2={groundY - 120}
                stroke="#94a3b8" strokeWidth="1.5"
                animate={{ stroke: ["#94a3b8", "#22d3ee", "#94a3b8"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            />

            {/* Hook */}
            <motion.line
                x1={cx} y1={groundY - 104} x2={cx} y2={groundY - 70}
                stroke="#475569" strokeWidth="3"
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
            />

            {/* Kelly / Top Drive */}
            <rect x={cx - 4} y={groundY - 85} width={8} height={30} rx="2" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="0.8" />
            <text x={cx + 12} y={groundY - 70} fill="#38bdf8" fontSize="5" fontFamily="monospace">KELLY</text>

            {/* Pipe in hole */}
            <motion.rect
                x={cx - 2} y={groundY - 55} width={4} height={55} fill="#38bdf8" fillOpacity="0.15"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Mud tanks */}
            <rect x={cx - 120} y={groundY + 10} width={50} height={20} rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x={cx - 95} y={groundY + 22} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">MUD TANKS</text>

            {/* Shale Shakers */}
            <rect x={cx - 55} y={groundY + 10} width={45} height={15} rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.8" />
            <motion.line
                x1={cx - 45} y1={groundY + 17} x2={cx - 20} y2={groundY + 17}
                stroke="#f59e0b" strokeWidth="1.5"
                animate={{ x1: [cx - 45, cx - 40, cx - 45], x2: [cx - 20, cx - 25, cx - 20] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
            />
            <text x={cx - 32} y={groundY + 30} fill="#94a3b8" fontSize="5" fontFamily="monospace" textAnchor="middle">SHAKERS</text>

            {/* Carousel - Rotating */}
            <motion.g
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                style={{ transformOrigin: `${cx + 80}px ${groundY - 60}px` }}
            >
                <circle cx={cx + 80} cy={groundY - 60} r={20} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,3" />
                <rect x={cx + 74} y={groundY - 80} width={12} height={8} rx="2" fill="#1e293b" stroke="#22d3ee" strokeWidth="0.8" />
            </motion.g>
            <text x={cx + 80} y={groundY - 30} fill="#94a3b8" fontSize="5" fontFamily="monospace" textAnchor="middle">PIPE RACK</text>

            {/* Depth label */}
            <text x={cx - 120} y={groundY - 40} fill="#64748b" fontSize="8" fontFamily="monospace">
                TD: {depth.toLocaleString()} ft
            </text>
            <text x={cx - 120} y={groundY - 28} fill="#64748b" fontSize="7" fontFamily="monospace">
                TYPE: {rigType}
            </text>

            {/* Legend */}
            <g transform={`translate(20, ${groundY + 60})`}>
                <motion.circle cx={0} cy={0} r={3} fill="#22d3ee" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Traveling Block Active</text>
            </g>
        </svg>
    );
}

// 3. COMPARISON METER (Onshore vs Offshore)
export function OnshoreOffshoreComparisonSVG({
    capexOnshore = 250,
    capexOffshore = 1200,
    opexOnshore = 8,
    opexOffshore = 25,
}: {
    capexOnshore?: number;
    capexOffshore?: number;
    opexOnshore?: number;
    opexOffshore?: number;
}) {
    const h = 300;
    const w = 480;
    const maxCapex = Math.max(capexOnshore, capexOffshore) * 1.1;
    const maxOpex = Math.max(opexOnshore, opexOffshore) * 1.1;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="14" />

            {/* Title */}
            <text x={w / 2} y={28} fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                ONSHORE vs OFFSHORE ECONOMICS
            </text>

            {/* CAPEX Bar */}
            <g transform="translate(60, 55)">
                <text x={180} y={-10} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">CAPEX ($MM)</text>

                {/* Onshore bar */}
                <rect x={0} y={0} width={130} height={0} fill="#1e293b" rx="6" />
                <motion.rect
                    x={0} y={0} width={0} height={24} rx="6"
                    fill="#22d3ee" fillOpacity="0.7"
                    animate={{ width: (capexOnshore / maxCapex) * 130 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
                <text x={135} y={17} fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">${capexOnshore}M</text>
                <text x={-5} y={42} fill="#64748b" fontSize="8" fontFamily="monospace">ONSHORE</text>

                {/* Offshore bar */}
                <rect x={0} y={55} width={130} height={0} fill="#1e293b" rx="6" />
                <motion.rect
                    x={0} y={55} width={0} height={24} rx="6"
                    fill="#f59e0b" fillOpacity="0.7"
                    animate={{ width: (capexOffshore / maxCapex) * 130 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                />
                <text x={135} y={72} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">${capexOffshore}M</text>
                <text x={-5} y={97} fill="#64748b" fontSize="8" fontFamily="monospace">OFFSHORE</text>
            </g>

            {/* OPEX Bar */}
            <g transform="translate(310, 55)">
                <text x={130} y={-10} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">OPEX ($/boe)</text>

                <rect x={0} y={0} width={130} height={0} fill="#1e293b" rx="6" />
                <motion.rect
                    x={0} y={0} width={0} height={24} rx="6"
                    fill="#22d3ee" fillOpacity="0.7"
                    animate={{ width: (opexOnshore / maxOpex) * 130 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
                />
                <text x={135} y={17} fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">${opexOnshore}/boe</text>

                <rect x={0} y={55} width={130} height={0} fill="#1e293b" rx="6" />
                <motion.rect
                    x={0} y={55} width={0} height={24} rx="6"
                    fill="#f59e0b" fillOpacity="0.7"
                    animate={{ width: (opexOffshore / maxOpex) * 130 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.9 }}
                />
                <text x={135} y={72} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">${opexOffshore}/boe</text>
            </g>

            {/* Risk Factors */}
            <g transform="translate(60, 170)">
                <text x={220} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RISK FACTORS</text>

                {[
                    { label: "HSE Exposure", onshore: 3, offshore: 8 },
                    { label: "Spud-to-TD Time", onshore: 2, offshore: 7 },
                    { label: "Weather Downtime", onshore: 2, offshore: 8 },
                    { label: "Reservoir Uncertainty", onshore: 5, offshore: 4 },
                    { label: "Supply Chain", onshore: 3, offshore: 7 },
                ].map((r, i) => {
                    const yOff = 18 + i * 16;
                    return (
                        <g key={r.label}>
                            <text x={0} y={yOff + 2} fill="#94a3b8" fontSize="7" fontFamily="monospace">{r.label}</text>
                            <motion.rect
                                x={130} y={yOff} width={0} height={8} rx="3"
                                fill="#22d3ee" fillOpacity="0.5"
                                animate={{ width: r.onshore * 8 }}
                                transition={{ duration: 1, delay: 1 + i * 0.15 }}
                            />
                            <motion.rect
                                x={220} y={yOff} width={0} height={8} rx="3"
                                fill="#f59e0b" fillOpacity="0.5"
                                animate={{ width: r.offshore * 8 }}
                                transition={{ duration: 1, delay: 1.2 + i * 0.15 }}
                            />
                            <text x={135 + r.onshore * 8} y={yOff + 7} fill="#22d3ee" fontSize="6" fontFamily="monospace">{r.onshore}</text>
                            <text x={225 + r.offshore * 8} y={yOff + 7} fill="#f59e0b" fontSize="6" fontFamily="monospace">{r.offshore}</text>
                        </g>
                    );
                })}
                <text x={130} y={100} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">← Onshore (1-10)</text>
                <text x={250} y={100} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">Offshore (1-10) →</text>
            </g>

            {/* Legend */}
            <g transform="translate(60, 275)">
                <rect x={0} y={0} width={8} height={8} rx="2" fill="#22d3ee" fillOpacity="0.7" />
                <text x={12} y={7} fill="#64748b" fontSize="7" fontFamily="monospace">Onshore</text>
                <rect x={70} y={0} width={8} height={8} rx="2" fill="#f59e0b" fillOpacity="0.7" />
                <text x={82} y={7} fill="#64748b" fontSize="7" fontFamily="monospace">Offshore</text>
            </g>
        </svg>
    );
}

// 4. WELL PROFILE DEPTH CHART
export function WellProfileDepthSVG({
    casingPoints = [
        { label: "Conductor", depth: 200, dia: 30 },
        { label: "Surface", depth: 2500, dia: 20 },
        { label: "Intermediate", depth: 7500, dia: 13.375 },
        { label: "Production", depth: 10000, dia: 9.625 },
    ],
}: {
    casingPoints?: { label: string; depth: number; dia: number }[];
}) {
    const h = 400;
    const w = 280;
    const padLeft = 50;
    const padRight = 40;
    const maxDepth = Math.max(...casingPoints.map((c) => c.depth)) * 1.1;
    const topY = 40;
    const botY = h - 50;
    const scale = (botY - topY) / maxDepth;
    const maxDia = Math.max(...casingPoints.map((c) => c.dia));
    const diaScale = 100 / maxDia;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="12" />

            <text x={w / 2} y={22} fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                CASING PROFILE
            </text>

            {/* Depth axis */}
            <line x1={padLeft} y1={topY} x2={padLeft} y2={botY} stroke="#475569" strokeWidth="1" />
            {[0, 2000, 4000, 6000, 8000, 10000, 12000].map((d) => {
                if (d > maxDepth) return null;
                const y = botY - d * scale;
                return (
                    <g key={d}>
                        <line x1={padLeft - 5} y1={y} x2={padLeft} y2={y} stroke="#475569" strokeWidth="0.8" />
                        <text x={padLeft - 8} y={y + 3} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end">{d}'</text>
                        <line x1={padLeft} y1={y} x2={w - padRight} y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
                    </g>
                );
            })}

            {/* Casing strings */}
            {casingPoints.map((c, i) => {
                const y = botY - c.depth * scale;
                const prevDepth = i > 0 ? casingPoints[i - 1].depth : 0;
                const prevY = i > 0 ? botY - prevDepth * scale : topY;
                const halfW = Math.max(c.dia * diaScale * 0.4, 4);
                const colors = ["#64748b", "#22d3ee", "#f59e0b", "#ef4444"];

                return (
                    <g key={c.label}>
                        {/* Casing body */}
                        <motion.rect
                            x={w / 2 - halfW / 2 + 10}
                            y={prevY} width={halfW} height={y - prevY}
                            fill={colors[i]} fillOpacity="0.12" rx="2"
                            stroke={colors[i]} strokeWidth="1" strokeOpacity="0.4"
                            initial={{ height: 0, y: prevY }}
                            animate={{ height: y - prevY, y: prevY }}
                            transition={{ duration: 1.2, delay: i * 0.3 }}
                        />

                        {/* Casing shoe pulse */}
                        <motion.circle
                            cx={w / 2 + 10} cy={y} r={5}
                            fill={colors[i]} fillOpacity="0.6"
                            animate={{ r: [4, 7, 4], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        />

                        {/* Label */}
                        <text x={w / 2 + 20 + halfW / 2} y={y - 6} fill={colors[i]} fontSize="7" fontFamily="monospace">
                            {c.label} ({c.dia}")
                        </text>
                        <text x={w / 2 + 20 + halfW / 2} y={y + 6} fill="#64748b" fontSize="6" fontFamily="monospace">
                            {c.depth.toLocaleString()} ft
                        </text>
                    </g>
                );
            })}

            {/* Center line */}
            <line x1={w / 2 + 10} y1={topY} x2={w / 2 + 10} y2={botY} stroke="#475569" strokeWidth="0.5" strokeOpacity="0.3" />

            {/* Legend */}
            <g transform={`translate(10, ${h - 25})`}>
                <motion.circle cx={0} cy={0} r={3} fill="#22d3ee" fillOpacity="0.6"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <text x={8} y={3} fill="#64748b" fontSize="6" fontFamily="monospace">Pulsing = Casing Shoe TD</text>
            </g>
        </svg>
    );
}