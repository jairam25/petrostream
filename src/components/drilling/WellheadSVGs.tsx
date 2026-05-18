import React from "react";
import { motion } from "motion/react";

// 1. CHRISTMAS TREE CROSS-SECTION (Surface Wellhead)
export function ChristmasTreeCutawaySVG({ isAnimating = true }: { isAnimating?: boolean }) {
    const h = 380;
    const w = 280;
    const cx = w / 2;
    const treeTop = 40;
    const treeBot = 300;
    const masterValveY = 190;
    const swabValveY = 120;
    const wingValveL = cx - 80;
    const wingValveR = cx + 80;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="treeBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="valveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <filter id="treeGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="16" />

            {/* Ground Level */}
            <line x1={30} y1={treeBot} x2={w - 30} y2={treeBot} stroke="#475569" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x={w - 35} y={treeBot - 6} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">GRADE</text>

            {/* Surface Casing */}
            <rect x={cx - 10} y={treeBot} width={20} height={25} fill="#94a3b8" fillOpacity="0.2" rx="1" />
            <motion.rect
                x={cx - 7}
                y={treeBot + 5}
                width={14}
                height={20}
                fill="#cbd5e1"
                fillOpacity="0.15"
                rx="1"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            />

            {/* Tubing Hanger */}
            <rect x={cx - 24} y={treeBot - 12} width={48} height={16} fill="#1e293b" rx="4" stroke="#475569" strokeWidth="1" />
            <text x={cx} y={treeBot - 16} fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TUBING HANGER</text>

            {/* Main Tree Body */}
            <motion.rect
                x={cx - 16}
                y={treeTop}
                width={32}
                height={treeBot - treeTop - 12}
                fill="url(#treeBody)"
                rx="6"
                stroke="#06b6d4"
                strokeWidth="1"
                strokeOpacity="0.4"
                animate={{ filter: ["drop-shadow(0 0 3px #06b6d4aa)", "drop-shadow(0 0 8px #06b6d466)", "drop-shadow(0 0 3px #06b6d4aa)"] }}
                transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* MASTER VALVE */}
            <g transform={`translate(${cx}, ${masterValveY})`}>
                <motion.rect
                    x={-22}
                    y={-8}
                    width={44}
                    height={16}
                    rx="4"
                    fill="url(#valveGrad)"
                    filter="url(#treeGlow)"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.circle
                    cx={0}
                    cy={0}
                    r={7}
                    fill="#22d3ee"
                    fillOpacity="0.8"
                    animate={{ r: [6, 8, 6], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                />
                <text x={28} y={3} fill="#67e8f9" fontSize="7" fontFamily="monospace">MASTER</text>
            </g>

            {/* SWAB VALVE */}
            <g transform={`translate(${cx}, ${swabValveY})`}>
                <motion.rect
                    x={-22}
                    y={-8}
                    width={44}
                    height={16}
                    rx="4"
                    fill="url(#valveGrad)"
                    filter="url(#treeGlow)"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
                <motion.circle
                    cx={0}
                    cy={0}
                    r={7}
                    fill="#22d3ee"
                    fillOpacity="0.8"
                    animate={{ r: [6, 8, 6], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
                />
                <text x={28} y={3} fill="#67e8f9" fontSize="7" fontFamily="monospace">SWAB</text>
            </g>

            {/* LEFT WING VALVE (KILL) */}
            <g transform={`translate(${wingValveL}, ${masterValveY - 25})`}>
                <line x1={0} y1={0} x2={cx - wingValveL - 22} y2={0} stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" />
                <motion.rect
                    x={-20}
                    y={-7}
                    width={40}
                    height={14}
                    rx="4"
                    fill="url(#valveGrad)"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }}
                />
                <text x={0} y={16} fill="#67e8f9" fontSize="7" fontFamily="monospace" textAnchor="middle">WING (KILL)</text>
            </g>

            {/* RIGHT WING VALVE (FLOW) */}
            <g transform={`translate(${wingValveR}, ${masterValveY - 25})`}>
                <line x1={0} y1={0} x2={wingValveR - cx - 22} y2={0} stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" />
                <motion.rect
                    x={-20}
                    y={-7}
                    width={40}
                    height={14}
                    rx="4"
                    fill="url(#valveGrad)"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: 1 }}
                />
                <motion.circle
                    cx={15}
                    cy={0}
                    r={5}
                    fill="#22d3ee"
                    fillOpacity="0.7"
                    animate={{ r: [4, 6, 4], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
                />
                <text x={0} y={16} fill="#67e8f9" fontSize="7" fontFamily="monospace" textAnchor="middle">WING (FLOW)</text>
            </g>

            {/* Flow Arrow */}
            <motion.g
                transform={`translate(${wingValveR}, ${masterValveY - 25})`}
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
            >
                <polygon points="45,-5 55,0 45,5" fill="#22d3ee" fillOpacity="0.8" />
                <line x1={40} y1={0} x2={48} y2={0} stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.6" />
            </motion.g>

            {/* Pressure Gauge at top */}
            <motion.g
                transform={`translate(${cx}, ${treeTop - 8})`}
                animate={{ rotate: [0, 3, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
            >
                <circle cx={0} cy={0} r={16} fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <motion.line
                    x1={0}
                    y1={0}
                    x2={0}
                    y2={-10}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    animate={{ rotate: [-30, 25, -30] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    style={{ transformOrigin: "0px 0px" }}
                />
                <circle cx={0} cy={0} r={3} fill="#f59e0b" />
            </motion.g>

            {/* Legend */}
            <g transform={`translate(${cx - 80}, ${treeBot + 40})`}>
                <circle cx={0} cy={0} r={4} fill="#22d3ee" fillOpacity="0.8" />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Pulsing = Active Valve</text>
            </g>
            <g transform={`translate(${cx - 80}, ${treeBot + 55})`}>
                <motion.circle
                    cx={0}
                    cy={0}
                    r={3}
                    fill="#f59e0b"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Pressure Gauge Live</text>
            </g>
        </svg>
    );
}

// 2. SUBSEA TREE CUTAWAY
export function SubseaTreeCutawaySVG({ isAnimating = true }: { isAnimating?: boolean }) {
    const h = 400;
    const w = 300;
    const cx = w / 2;
    const mudlineY = 280;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#082f49" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="subseaTreeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.35" />
                </linearGradient>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="16" />

            {/* Water Depth Indicator */}
            <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 3 }}>
                <text x={cx} y={25} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    WATER DEPTH: 7,500 ft
                </text>
                <line x1={cx} y1={30} x2={cx} y2={44} stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
                <polygon points={`${cx - 5},44 ${cx + 5},44 ${cx},50`} fill="#38bdf8" fillOpacity="0.6" />
            </motion.g>

            {/* Water Column */}
            <rect x={cx - 3} y={50} width={6} height={mudlineY - 50} fill="url(#waterGrad)" rx="2" />

            {/* Floating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.circle
                    key={`p${i}`}
                    cx={cx + (Math.sin(i * 1.7) * 30)}
                    cy={60 + (i * 20)}
                    r={1.5}
                    fill="#38bdf8"
                    fillOpacity={0.4}
                    animate={{
                        y: [(i * 20) + 60, (i * 20) + 80, (i * 20) + 60],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.15 }}
                />
            ))}

            {/* Mudline */}
            <line x1={20} y1={mudlineY} x2={w - 20} y2={mudlineY} stroke="#92400e" strokeWidth="2" strokeDasharray="8,4" />
            <text x={w - 25} y={mudlineY - 6} fill="#a16207" fontSize="8" fontFamily="monospace" textAnchor="end">MUDLINE</text>

            {/* Wellhead Housing */}
            <rect x={cx - 35} y={mudlineY} width={70} height={14} fill="#1e293b" rx="3" stroke="#475569" strokeWidth="1" />
            <text x={cx} y={mudlineY + 10} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">WELLHEAD HOUSING</text>

            {/* Conductor Pipe */}
            <rect x={cx - 12} y={mudlineY + 14} width={24} height={40} fill="#94a3b8" fillOpacity="0.15" rx="2" stroke="#64748b" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x={cx - 5} y={mudlineY + 14} width={10} height={38} fill="#38bdf8" fillOpacity="0.1" rx="1" />

            {/* Subsea Tree Body */}
            <motion.g
                animate={{
                    filter: [
                        "drop-shadow(0 0 4px #f59e0b44)",
                        "drop-shadow(0 0 10px #f59e0b22)",
                        "drop-shadow(0 0 4px #f59e0b44)",
                    ],
                }}
                transition={{ repeat: Infinity, duration: 3.5 }}
            >
                <rect
                    x={cx - 25}
                    y={mudlineY - 45}
                    width={50}
                    height={45}
                    fill="url(#subseaTreeGrad)"
                    rx="8"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                />
                <rect
                    x={cx - 10}
                    y={mudlineY - 38}
                    width={20}
                    height={30}
                    rx="4"
                    fill="#0f172a"
                    stroke="#d97706"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                />
                <text x={cx} y={mudlineY - 24} fill="#fbbf24" fontSize="6" fontFamily="monospace" textAnchor="middle">CHOKE</text>
            </motion.g>

            {/* ROV Panel */}
            <rect x={cx - 35} y={mudlineY - 42} width={8} height={20} rx="2" fill="#06b6d4" fillOpacity="0.3" stroke="#06b6d4" strokeWidth="0.5" />
            <text x={cx - 31} y={mudlineY - 50} fill="#22d3ee" fontSize="6" fontFamily="monospace" textAnchor="middle">ROV</text>

            {/* Flowline */}
            <line x1={cx + 25} y1={mudlineY - 25} x2={cx + 65} y2={mudlineY - 25} stroke="#d97706" strokeWidth="2" strokeOpacity="0.5" />
            <motion.g animate={{ x: [0, 4, 0], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <polygon points={`${cx + 65},${mudlineY - 30} ${cx + 72},${mudlineY - 25} ${cx + 65},${mudlineY - 20}`} fill="#f59e0b" fillOpacity="0.7" />
            </motion.g>
            <text x={cx + 72} y={mudlineY - 14} fill="#fbbf24" fontSize="7" fontFamily="monospace">TO FLOWLINE</text>

            {/* Umbilical */}
            <line x1={cx - 25} y1={mudlineY - 15} x2={cx - 55} y2={40} stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3,2" />
            <text x={cx - 58} y={38} fill="#22d3ee" fontSize="7" fontFamily="monospace" textAnchor="end">UMBILICAL</text>

            {/* Platform */}
            <rect x={cx - 30} y={5} width={60} height={14} rx="4" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
            <text x={cx} y={14} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">FPSO / PLATFORM</text>

            {/* Acoustic Beacon */}
            <motion.g
                transform={`translate(${cx + 32}, ${mudlineY - 55})`}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
            >
                <circle cx={0} cy={0} r={5} fill="#22d3ee" fillOpacity="0.4" />
                <circle cx={0} cy={0} r={2} fill="#22d3ee" />
            </motion.g>
            <text x={cx + 32} y={mudlineY - 62} fill="#67e8f9" fontSize="6" fontFamily="monospace" textAnchor="middle">ACOUSTIC</text>

            {/* Legend */}
            <g transform={`translate(${cx - 70}, ${mudlineY + 65})`}>
                <motion.circle
                    cx={0}
                    cy={0}
                    r={3}
                    fill="#f59e0b"
                    fillOpacity="0.7"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Subsea Tree (Live Monitor)</text>
            </g>
        </svg>
    );
}

// 3. BOP STACK VISUALIZATION
export function BOPStackSVG({ isAnimating = true }: { isAnimating?: boolean }) {
    const h = 380;
    const w = 200;
    const cx = w / 2;
    const stackTop = 30;
    const stackBot = 320;

    const rams = [
        { label: "BLIND/SHEAR", y: stackTop + 20, color: "#ef4444" },
        { label: "PIPE RAM (Upper)", y: stackTop + 70, color: "#f59e0b" },
        { label: "PIPE RAM (Middle)", y: stackTop + 120, color: "#f59e0b" },
        { label: "PIPE RAM (Lower)", y: stackTop + 170, color: "#f59e0b" },
        { label: "ANNULAR", y: stackTop + 230, color: "#06b6d4" },
        { label: "WELLHEAD CONN.", y: stackTop + 280, color: "#64748b" },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="bopBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="12" />

            {/* BOP Stack body */}
            <motion.rect
                x={cx - 30}
                y={stackTop}
                width={60}
                height={stackBot - stackTop}
                fill="url(#bopBody)"
                rx="6"
                stroke="#475569"
                strokeWidth="1"
                animate={{
                    filter: [
                        "drop-shadow(0 0 3px #47556944)",
                        "drop-shadow(0 0 8px #06b6d422)",
                        "drop-shadow(0 0 3px #47556944)",
                    ],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Ram cavities */}
            {rams.map((r, i) => (
                <g key={i} transform={`translate(${cx}, ${r.y})`}>
                    <motion.rect
                        x={-30}
                        y={-8}
                        width={12}
                        height={16}
                        rx="2"
                        fill={r.color}
                        fillOpacity="0.6"
                        stroke={r.color}
                        strokeWidth="0.5"
                        animate={{ x: [-30, (i === 0 && isAnimating) ? -10 : -28, -30] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3, ease: "easeInOut" }}
                    />
                    <motion.rect
                        x={18}
                        y={-8}
                        width={12}
                        height={16}
                        rx="2"
                        fill={r.color}
                        fillOpacity="0.6"
                        stroke={r.color}
                        strokeWidth="0.5"
                        animate={{ x: [18, (i === 0 && isAnimating) ? 10 : 16, 18] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3, ease: "easeInOut" }}
                    />
                    <text x={0} y={12} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        {r.label}
                    </text>
                </g>
            ))}

            {/* Choke & Kill Lines */}
            <motion.line
                x1={cx - 30}
                y1={stackTop + 80}
                x2={cx - 60}
                y2={stackTop + 80}
                stroke="#06b6d4"
                strokeWidth="2"
                strokeOpacity="0.4"
                animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
            <text x={cx - 62} y={stackTop + 75} fill="#22d3ee" fontSize="6" fontFamily="monospace" textAnchor="end">KILL</text>

            <motion.line
                x1={cx + 30}
                y1={stackTop + 135}
                x2={cx + 60}
                y2={stackTop + 135}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeOpacity="0.4"
                animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
            <text x={cx + 62} y={stackTop + 130} fill="#fbbf24" fontSize="6" fontFamily="monospace">CHOKE</text>

            {/* Top connection */}
            <rect x={cx - 8} y={stackTop - 8} width={16} height={10} fill="#475569" rx="2" />
            <text x={cx} y={stackTop - 12} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">RISER / DP</text>
        </svg>
    );
}

// 4. PRESSURE RATING DONUT GAUGE
export function PressureRatingGaugeSVG({ pressureKsi = 10, maxKsi = 20 }: { pressureKsi?: number; maxKsi?: number }) {
    const h = 200;
    const w = 200;
    const cx = w / 2;
    const cy = h / 2;
    const r = 70;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(pressureKsi / maxKsi, 1);
    const dashOffset = circumference * (1 - pct);
    const isDanger = pct > 0.8;
    const color = isDanger ? "#ef4444" : pct > 0.6 ? "#f59e0b" : "#22d3ee";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <filter id="gaugeGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <radialGradient id="gaugeCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="transparent" />

            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="12" />

            {/* Filled arc */}
            <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                filter="url(#gaugeGlow)"
                transform={`rotate(-90 ${cx} ${cy})`}
            />

            {/* Center glow */}
            <motion.circle
                cx={cx}
                cy={cy}
                r={40}
                fill="url(#gaugeCenter)"
                animate={{ r: [38, 44, 38], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Center text */}
            <text x={cx} y={cy - 10} fill="white" fontSize="28" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {pressureKsi}K
            </text>
            <text x={cx} y={cy + 14} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">PSI RATING</text>

            {/* Tick marks */}
            {[0, 5, 10, 15, 20].map((v) => {
                const angle = -90 + (v / maxKsi) * 360;
                const rad = (angle * Math.PI) / 180;
                const tx = cx + (r + 18) * Math.cos(rad);
                const ty = cy + (r + 18) * Math.sin(rad);
                return (
                    <text key={v} x={tx} y={ty} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
                        {v}K
                    </text>
                );
            })}

            {/* Pulse indicator */}
            <motion.circle
                cx={cx}
                cy={cy - r - 5}
                r={3}
                fill={color}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            />
        </svg>
    );
}

// 5. VALVE ACTUATION DIAGRAM
export function ValveActuationDiagramSVG({ isAnimating = true }: { isAnimating?: boolean }) {
    const h = 200;
    const w = 500;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="10" />

            {/* HPU */}
            <rect x={20} y={70} width={60} height={50} rx="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
            <text x={50} y={88} fill="#22d3ee" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">HYDRAULIC</text>
            <text x={50} y={100} fill="#22d3ee" fontSize="6" fontFamily="monospace" textAnchor="middle">POWER UNIT</text>
            <motion.circle
                cx={50}
                cy={110}
                r={5}
                fill="#22d3ee"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            />

            {/* Flow to accumulator */}
            <motion.line
                x1={80}
                y1={95}
                x2={140}
                y2={95}
                stroke="#06b6d4"
                strokeWidth={3}
                animate={{ strokeOpacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
            />
            <motion.circle
                cx={90}
                cy={95}
                r={3}
                fill="#22d3ee"
                animate={{ cx: [90, 130, 90], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
            />

            {/* Accumulator */}
            <rect x={140} y={60} width={50} height={70} rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x={165} y={80} fill="#fbbf24" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ACCUM-</text>
            <text x={165} y={93} fill="#fbbf24" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ULATOR</text>
            <motion.rect
                x={146}
                y={102}
                width={38}
                height={8}
                rx="2"
                fill="#f59e0b"
                fillOpacity="0.3"
                animate={{ height: [8, 20, 8], y: [102, 94, 102] }}
                transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Flow to actuator */}
            <motion.line
                x1={190}
                y1={95}
                x2={280}
                y2={95}
                stroke="#f59e0b"
                strokeWidth={3}
                animate={{ strokeOpacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            />
            <motion.circle
                cx={200}
                cy={95}
                r={3}
                fill="#fbbf24"
                animate={{ cx: [200, 270, 200], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
            />

            {/* Actuator */}
            <rect x={280} y={60} width={70} height={70} rx="8" fill="#1e293b" stroke="#22d3ee" strokeWidth="1" />
            <text x={315} y={80} fill="#22d3ee" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ACTUATOR</text>
            <motion.rect
                x={305}
                y={85}
                width={20}
                height={25}
                rx="3"
                fill="#06b6d4"
                fillOpacity="0.3"
                animate={{ height: [25, 35, 25], y: [85, 80, 85] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            />
            <motion.text
                x={315}
                y={125}
                fill="#67e8f9"
                fontSize="6"
                fontFamily="monospace"
                textAnchor="middle"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                FAIL-SAFE
            </motion.text>

            {/* Stem */}
            <motion.line
                x1={350}
                y1={95}
                x2={410}
                y2={95}
                stroke="#94a3b8"
                strokeWidth={4}
                animate={{ stroke: ["#94a3b8", "#22d3ee", "#94a3b8"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            />

            {/* Gate Valve */}
            <rect x={410} y={70} width={70} height={50} rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x={445} y={90} fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">GATE</text>
            <text x={445} y={105} fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">VALVE</text>
            <motion.rect
                x={436}
                y={88}
                width={18}
                height={6}
                rx="2"
                fill="#38bdf8"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            />

            {/* Flow through valve */}
            <motion.line
                x1={410}
                y1={95}
                x2={440}
                y2={95}
                stroke="#06b6d4"
                strokeWidth={2}
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            />
            <motion.g animate={{ x: [0, 5, 0], opacity: [0.3, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>
                <polygon points="470,90 478,95 470,100" fill="#22d3ee" />
            </motion.g>
            <text x={485} y={85} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">TO WELL</text>
            <text x={485} y={108} fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">OR CHOKE</text>

            {/* Labels */}
            <text x={50} y={150} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">HPU</text>
            <text x={165} y={150} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">STORAGE</text>
            <text x={315} y={150} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">CONTROL</text>
            <text x={445} y={150} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">ISOLATION</text>
        </svg>
    );
}

// 6. RING GASKET / SEAL CUTAWAY
export function RingGasketCutawaySVG({ type = "BX" }: { type?: "R" | "RX" | "BX" }) {
    const h = 180;
    const w = 360;
    const color = type === "BX" ? "#ef4444" : type === "RX" ? "#f59e0b" : "#22d3ee";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="gasketMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
            </defs>
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="10" />

            {/* Upper flange */}
            <rect x={60} y={20} width={240} height={30} rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x={180} y={38} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">UPPER FLANGE FACE</text>

            {/* Lower flange */}
            <rect x={60} y={130} width={240} height={30} rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x={180} y={148} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LOWER FLANGE FACE</text>

            {/* Gasket */}
            <motion.ellipse
                cx={180}
                cy={90}
                rx={30}
                ry={20}
                fill="url(#gasketMetal)"
                stroke={color}
                strokeWidth="2"
                animate={{ filter: ["drop-shadow(0 0 2px transparent)", `drop-shadow(0 0 6px ${color}44)`, "drop-shadow(0 0 2px transparent)"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
            />

            {/* Sealing arrows */}
            <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
                <line x1={160} y1={45} x2={165} y2={70} stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
                <polygon points="160,45 164,42 165,48" fill={color} fillOpacity="0.6" />
                <line x1={200} y1={145} x2={195} y2={110} stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
                <polygon points="200,145 196,148 195,142" fill={color} fillOpacity="0.6" />
            </motion.g>

            {/* Type label */}
            <text x={180} y={90} fill="white" fontSize="20" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                {type}
            </text>
            <text x={180} y={170} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                API 6A {type === "BX" ? "Metal-to-Metal, 10-20K PSI" : type === "RX" ? "Pressure-Energized, ≤5K PSI" : "Interference-Fit, ≤5K PSI"}
            </text>

            <text x={300} y={80} fill="#64748b" fontSize="6" fontFamily="monospace">SEAL</text>
            <text x={300} y={95} fill="#64748b" fontSize="6" fontFamily="monospace">CONTACT</text>
        </svg>
    );
}