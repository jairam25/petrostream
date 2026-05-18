import React from "react";
import { motion } from "motion/react";

// 1. ROTATING DRILL BIT CROSS-SECTION
export function DrillBitCrossSectionSVG({ bitType = "PDC", rpm = 120 }: { bitType?: string; rpm?: number }) {
    const h = 320;
    const w = 320;
    const cx = w / 2;
    const cy = h / 2;
    const bitR = 80;
    const isPDC = bitType === "PDC";
    const isTCI = bitType === "TCI";
    const primaryColor = isPDC ? "#22d3ee" : isTCI ? "#f59e0b" : "#a78bfa";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="bitGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.15" />
                    <stop offset="70%" stopColor={primaryColor} stopOpacity="0.05" />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                </radialGradient>
                <filter id="bitFilter">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="14" />

            {/* Rotation glow */}
            <motion.circle
                cx={cx} cy={cy} r={bitR + 30} fill="url(#bitGlow)"
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />

            {/* Bit body */}
            <motion.g
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: (60 / (rpm || 120)) * 2, ease: "linear" }}
            >
                {/* Main bit shape */}
                <polygon
                    points={`${cx - bitR},${cy} ${cx - bitR * 0.5},${cy + bitR * 1.2} ${cx + bitR * 0.5},${cy + bitR * 1.2} ${cx + bitR},${cy}`}
                    fill="#1e293b"
                    stroke={primaryColor}
                    strokeWidth="2"
                    filter="url(#bitFilter)"
                />

                {/* Cutters / Teeth */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const angle = (i / 5) * Math.PI - Math.PI;
                    const x1 = cx + Math.cos(angle) * bitR * 0.75;
                    const y1 = cy + Math.sin(angle) * bitR * 0.3;
                    const x2 = cx + Math.cos(angle) * bitR * 0.55;
                    const y2 = cy + Math.sin(angle) * bitR * 0.7;
                    return (
                        <g key={i}>
                            <motion.circle
                                cx={x1} cy={y1} r={isPDC ? 6 : 5}
                                fill={primaryColor} fillOpacity="0.8"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                            />
                            <motion.circle
                                cx={x2} cy={y2} r={isPDC ? 6 : 5}
                                fill={primaryColor} fillOpacity="0.8"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 + 0.3 }}
                            />
                        </g>
                    );
                })}

                {/* Center jet */}
                <circle cx={cx} cy={cy - 4} r={6} fill="#38bdf8" fillOpacity="0.5" />
            </motion.g>

            {/* Stationary nozzles (doesn't rotate with bit - just visual indicator) */}
            {[0, 72, 144, 216, 288].map((angle) => (
                <circle
                    key={`n${angle}`}
                    cx={cx + Math.cos((angle * Math.PI) / 180) * bitR * 0.5}
                    cy={cy + Math.sin((angle * Math.PI) / 180) * bitR * 0.5 - 10}
                    r={3}
                    fill="#67e8f9"
                    fillOpacity="0.4"
                />
            ))}

            {/* Labels */}
            <text x={cx} y={cy + bitR + 30} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {bitType} BIT
            </text>
            <text x={cx} y={cy + bitR + 45} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                RPM: {rpm} | Rotation: Live
            </text>

            {/* Legend */}
            <g transform={`translate(20, ${h - 50})`}>
                <motion.circle cx={0} cy={0} r={4} fill={primaryColor} fillOpacity="0.8"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <text x={10} y={3} fill="#64748b" fontSize="7" fontFamily="monospace">Cutters Pulsing</text>
            </g>
        </svg>
    );
}

// 2. IADC BIT CODE DECODER
export function IADCCodeDecoderSVG({ iadcCode = "M323" }: { iadcCode?: string }) {
    const h = 280;
    const w = 500;
    const ch = iadcCode || "M323";
    const series = ch.length >= 3 ? ch.slice(1, 2) : "3";
    const type = ch.length >= 4 ? ch.slice(2, 3) : "2";
    const hardness = ch.length >= 5 ? ch.slice(3) : "3";
    const seriesNames: Record<string, string> = {
        "1": "Steel Tooth",
        "2": "TCI Insert",
        "3": "PDC / Diamond",
        "4": "Impregnated",
    };

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="12" />

            {/* IADC Code */}
            <text x={w / 2} y={35} fill="white" fontSize="16" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                IADC CODE: {ch}
            </text>

            {/* Boxes */}
            {[
                { label: ch[0] || "M", sub: "Body Material", x: 60, color: "#22d3ee", desc: ch[0] === "M" ? "Matrix Body" : "Steel Body" },
                { label: series, sub: "Series", x: 155, color: "#f59e0b", desc: seriesNames[series] || "Mixed" },
                { label: type, sub: "Type", x: 250, color: "#a78bfa", desc: `Hardness Grade ${type}` },
                { label: hardness, sub: "Wear/Feature", x: 345, color: "#34d399", desc: `Sub-feature ${hardness}` },
            ].map((b, i) => (
                <motion.g key={i}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                >
                    <rect x={b.x - 30} y={55} width={60} height={45} rx="8" fill="#1e293b" stroke={b.color} strokeWidth="2" />
                    <text x={b.x} y={75} fill={b.color} fontSize="18" fontFamily="monospace" fontWeight="black" textAnchor="middle">{b.label}</text>
                    <text x={b.x} y={115} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">{b.sub}</text>
                    <text x={b.x} y={128} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">{b.desc}</text>
                </motion.g>
            ))}

            {/* Connection arrows */}
            {[0, 1, 2].map((i) => (
                <motion.g key={`arr${i}`}>
                    <line
                        x1={95 + i * 95} y1={77} x2={125 + i * 95} y2={77}
                        stroke="#475569" strokeWidth="1.5"
                    />
                    <motion.polygon
                        points={`${123 + i * 95},74 ${129 + i * 95},77 ${123 + i * 95},80`}
                        fill="#475569"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    />
                </motion.g>
            ))}

            {/* Formation hardness scale */}
            <g transform="translate(40, 155)">
                <text x={0} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">FORMATION HARDNESS</text>
                <rect x={0} y={10} width={420} height={6} rx="3" fill="#1e293b" />
                <rect x={0} y={10} width={Number(hardness) * 80 || 210} height={6} rx="3" fill="#34d399" fillOpacity="0.6" />
                <motion.rect
                    x={(Number(hardness) * 80 || 210) - 4} y={6} width={8} height={14} rx="2" fill="#34d399"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
                {["Soft", "Med-Soft", "Med", "Med-Hard", "Hard"].map((l, i) => (
                    <text key={l} x={i * 85} y={32} fill="#475569" fontSize="7" fontFamily="monospace" textAnchor="middle">{l}</text>
                ))}
            </g>

            {/* Animation indicator */}
            <g transform="translate(40, 200)">
                <motion.circle cx={0} cy={0} r={4} fill="#22d3ee" fillOpacity="0.7"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                />
                <text x={12} y={3} fill="#64748b" fontSize="8" fontFamily="monospace">
                    IADC references per API Spec 7-1 / ISO 23510
                </text>
            </g>
        </svg>
    );
}

// 3. DRILLING PARAMETERS LIVE GAUGE
export function DrillingParametersGaugeSVG({
    wob = 25,
    maxWob = 50,
    rpm = 120,
    maxRpm = 300,
    torque = 15,
    maxTorque = 30,
}: {
    wob?: number;
    maxWob?: number;
    rpm?: number;
    maxRpm?: number;
    torque?: number;
    maxTorque?: number;
}) {
    const h = 220;
    const w = 480;

    const gauges = [
        { value: wob, max: maxWob, label: "WOB (klbs)", x: 80, color: "#22d3ee" },
        { value: rpm, max: maxRpm, label: "RPM", x: 240, color: "#f59e0b" },
        { value: torque, max: maxTorque, label: "TORQUE (kft·lb)", x: 400, color: "#ef4444" },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="12" />

            {gauges.map((g, idx) => {
                const r = 55;
                const pct = Math.min(g.value / g.max, 1);
                const dashOffset = Math.PI * r * (1 - pct);
                const circumference = Math.PI * r;

                return (
                    <g key={idx} transform={`translate(${g.x}, 110)`}>
                        <text x={0} y={-65} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            {g.label}
                        </text>

                        {/* Background arc */}
                        <circle cx={0} cy={0} r={r} fill="none" stroke="#1e293b" strokeWidth="8" strokeDasharray={`${circumference}`} transform="rotate(-90)" />

                        {/* Filled arc */}
                        <motion.circle
                            cx={0} cy={0} r={r} fill="none" stroke={g.color} strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference}
                            animate={{ strokeDashoffset: dashOffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            transform="rotate(-90)"
                        />

                        {/* Value text */}
                        <text x={0} y={-10} fill="white" fontSize="16" fontFamily="monospace" fontWeight="black" textAnchor="middle">{g.value}</text>
                        <text x={0} y={8} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">of {g.max}</text>

                        {/* Pulse */}
                        <motion.circle
                            cx={0} cy={-r - 3} r={2.5}
                            fill={g.color}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.3 }}
                        />
                    </g>
                );
            })}
        </svg>
    );
}

// 4. BIT WEAR / DULL GRADE
export function BitWearDullGradeSVG({ innerWear = 3, outerWear = 2 }: { innerWear?: number; outerWear?: number }) {
    const h = 240;
    const w = 400;
    const cx = w / 2;
    const cy = h / 2 + 10;

    const teeth = [
        { inner: true, x: -20, wear: innerWear },
        { inner: true, x: -10, wear: innerWear },
        { inner: true, x: 0, wear: innerWear },
        { inner: true, x: 10, wear: innerWear },
        { inner: true, x: 20, wear: innerWear },
        { inner: false, x: -55, wear: outerWear },
        { inner: false, x: -40, wear: outerWear },
        { inner: false, x: -30, wear: outerWear },
        { inner: false, x: 30, wear: outerWear },
        { inner: false, x: 40, wear: outerWear },
        { inner: false, x: 55, wear: outerWear },
    ];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={w} height={h} fill="#02050a" rx="12" />

            <text x={cx} y={30} fill="white" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                IADC DULL GRADING
            </text>

            {/* Bit face */}
            <circle cx={cx} cy={cy} r={75} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />
            <circle cx={cx} cy={cy} r={35} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,2" />

            {/* Cutters */}
            {teeth.map((t, i) => {
                const hVal = 16 - t.wear * 3;
                const freshH = 16;
                const wornY = cy + (freshH - hVal);
                return (
                    <g key={i}>
                        {/* Fresh tooth outline */}
                        <rect x={cx + t.x - 3} y={cy - freshH} width={6} height={freshH} rx="2" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeOpacity="0.3" />
                        {/* Worn tooth */}
                        <motion.rect
                            x={cx + t.x - 3} y={wornY} width={6} height={hVal} rx="2"
                            fill={t.wear >= 5 ? "#ef4444" : t.wear >= 3 ? "#f59e0b" : "#22d3ee"}
                            fillOpacity="0.7"
                            animate={{ opacity: [0.5, 0.9, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                        />
                    </g>
                );
            })}

            {/* Center cone */}
            <circle cx={cx} cy={cy} r={12} fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* Labels */}
            <text x={cx - 50} y={cy + 95} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">INNER: {innerWear}/8</text>
            <text x={cx + 50} y={cy + 95} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">OUTER: {outerWear}/8</text>
            <text x={cx} y={cy + 110} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                {innerWear >= 5 || outerWear >= 5 ? "BIT SHOULD BE PULLED" : "ACCEPTABLE WEAR"}
            </text>

            {/* Wear scale */}
            <g transform="translate(40, 160)">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((v, i) => (
                    <rect key={v} x={i * 28} y={0} width={20} height={8} rx="2"
                        fill={v >= 5 ? "#ef4444" : v >= 3 ? "#f59e0b" : "#22d3ee"}
                        fillOpacity="0.4"
                    />
                ))}
                <text x={0} y={20} fill="#64748b" fontSize="6" fontFamily="monospace">0</text>
                <text x={224} y={20} fill="#64748b" fontSize="6" fontFamily="monospace">8</text>
                <text x={110} y={20} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">WEAR SCALE (1/8 increments)</text>
            </g>
        </svg>
    );
}