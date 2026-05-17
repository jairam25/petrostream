/**
 * @license Apache-2.0
 * Phase 4 Production: Surface Processing — SVG Diagrams for 6 Tabs
 *
 * Tab 1: SeparatorDesignTab — 3-phase separator cross section + multi-stage diagram
 * Tab 2: CrudeOilTreatmentTab — heater treater / desalter / stabilizer train
 * Tab 3: GasProcessingTab — amine + TEG + NGL + Claus block flow
 * Tab 4: ProducedWaterManagementTab — hydrocyclone / IGF / filter train + Hall plot
 * Tab 5: UtilitiesPowerTab — power gen one-line + steam balance + flare stack
 * Tab 6: FacilitySafetyTab — hazardous area plan + SIL bar chart + blowdown curve
 */

import React from 'react';

// ============================================================
// TAB 1 — SEPARATOR
// ============================================================

export const ThreePhaseSeparatorSVG: React.FC<{
    diameter: number; oilPadIn: number; waterPadIn: number; lengthFt: number;
    gasCapMMscfd: number; liquidCapBFPD: number;
}> = ({ diameter, oilPadIn, waterPadIn, lengthFt, gasCapMMscfd, liquidCapBFPD }) => {
    const cx = 300, cy = 120, r = 90, w = 500;
    return (
        <svg viewBox="0 0 640 320" style={{ width: '100%', maxWidth: 640, background: '#0f1923' }}>
            <text x={320} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>3-Phase Horizontal Separator — Cross Section</text>
            {/* Shell */}
            <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="none" stroke="#546e7a" strokeWidth={2.5} />
            <rect x={cx - w / 2} y={cy - r} width={w} height={2 * r} fill="none" stroke="#546e7a" strokeWidth={2.5} />
            <ellipse cx={cx - w / 2} cy={cy} rx={r} ry={r} fill="none" stroke="#546e7a" strokeWidth={2.5} />
            <ellipse cx={cx + w / 2} cy={cy} rx={r} ry={r} fill="none" stroke="#546e7a" strokeWidth={2.5} />
            {/* Gas zone */}
            <rect x={cx - w / 2} y={cy - r} width={w} height={r * 1.2} fill="rgba(255,213,79,0.12)" />
            <text x={cx} y={cy - 40} fill="#ffd54f" fontSize={11} textAnchor="middle">Gas Zone ({gasCapMMscfd} MMscfd)</text>
            <circle cx={cx + 80} cy={cy - r + 8} r={3} fill="#ffd54f" /><text x={cx + 88} y={cy - r + 12} fill="#ffd54f" fontSize={8}>mist extractor</text>
            {/* Oil pad */}
            <rect x={cx - w / 2} y={cy + r * 0.2} width={w} height={oilPadIn / diameter * 2 * r} fill="rgba(129,212,250,0.2)" />
            <text x={cx} y={cy + r * 0.45 + (oilPadIn / diameter) * r} fill="#81d4fa" fontSize={10} textAnchor="middle">Oil Pad ({oilPadIn}″)</text>
            {/* Water pad */}
            <rect x={cx - w / 2} y={cy + r * 0.2 + (oilPadIn / diameter) * 2 * r} width={w} height={waterPadIn / diameter * 2 * r} fill="rgba(66,165,245,0.25)" />
            <text x={cx} y={cy + r * 0.95} fill="#42a5f5" fontSize={10} textAnchor="middle">Water Pad ({waterPadIn}″)</text>
            {/* Weir */}
            <line x1={cx - 40} y1={cy + r * 0.2 + oilPadIn / diameter * 2 * r} x2={cx - 40} y2={cy + r} stroke="#ff8a65" strokeWidth={3} strokeDasharray="4,2" />
            <text x={cx - 55} y={cy + r * 0.6} fill="#ff8a65" fontSize={8} transform={`rotate(-90, ${cx - 55}, ${cy + r * 0.6})`}>weir</text>
            {/* Inlet */}
            <line x1={80} y1={cy - r - 20} x2={80} y2={cy - r} stroke="#4fc3f7" strokeWidth={2} />
            <text x={70} y={cy - r - 30} fill="#4fc3f7" fontSize={9}>Inlet</text>
            {/* Gas outlet */}
            <line x1={cx + w / 2 + r - 10} y1={cy - r + 10} x2={cx + w / 2 + r + 25} y2={cy - r - 15} stroke="#ffd54f" strokeWidth={2} />
            <text x={cx + w / 2 + r + 8} y={cy - r - 18} fill="#ffd54f" fontSize={9}>Gas Out</text>
            {/* Oil outlet */}
            <line x1={cx - w / 2 + 20} y1={cy + r * 0.2 + (oilPadIn / diameter) * r} x2={cx - w / 2 + 50} y2={cy + 2 * r + 15} stroke="#81d4fa" strokeWidth={2} />
            <text x={cx - w / 2 + 15} y={cy + 2 * r + 28} fill="#81d4fa" fontSize={9}>Oil Out</text>
            {/* Water outlet */}
            <line x1={cx - w / 2 + 20} y1={cy + r * 0.95} x2={cx - w / 2 + 50} y2={cy + 2 * r - 5} stroke="#42a5f5" strokeWidth={2} />
            <text x={cx - w / 2 + 15} y={cy + 2 * r + 12} fill="#42a5f5" fontSize={9}>Water Out</text>
            {/* Vortex breaker */}
            <circle cx={cx - w / 2 + 20} cy={cy + r * 0.95} r={5} fill="none" stroke="#78909c" strokeWidth={1} />
            {/* Dimensions */}
            <text x={cx} y={cy + 2 * r + 40} fill="#78909c" fontSize={9} textAnchor="middle">
                ⌀{diameter}″ × {lengthFt}′ — Design Pressure: per ASME VIII Div1
            </text>
            <text x={10} y={310} fill="#546e7a" fontSize={8}>Liquid capacity: {liquidCapBFPD} BFPD | Retention: 5 min standard</text>
        </svg>
    );
};

export const MultiStageSeparatorFlowSVG: React.FC<{
    stages: { label: string; pressure: number; gasMMscfd: number; oilSTBD: number }[];
}> = ({ stages }) => {
    const yBase = 60, step = 80;
    return (
        <svg viewBox="0 0 660 320" style={{ width: '100%', maxWidth: 660, background: '#0f1923' }}>
            <text x={330} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Multi-Stage Separation — Pressure Cascade</text>
            {stages.map((s, i) => {
                const y = yBase + i * step;
                return (
                    <g key={i}>
                        <rect x={50} y={y - 12} width={60} height={24} rx={4} fill="#1c2833" stroke="#4fc3f7" strokeWidth={1.5} />
                        <text x={80} y={y + 3} fill="#4fc3f7" fontSize={9} textAnchor="middle">{s.label}</text>
                        <text x={125} y={y + 3} fill="#78909c" fontSize={9}>{s.pressure} psig</text>
                        {/* Gas stream */}
                        <line x1={180} y1={y - 12} x2={180} y2={y - 30} stroke="#ffd54f" strokeWidth={2} />
                        <line x1={180} y1={y - 30} x2={280} y2={y - 30} stroke="#ffd54f" strokeWidth={2} />
                        <text x={280} y={y - 34} fill="#ffd54f" fontSize={8} textAnchor="end">{s.gasMMscfd} MMscfd gas</text>
                        {/* Oil stream to next stage */}
                        <line x1={180} y1={y + 12} x2={180} y2={y + 20} stroke="#81d4fa" strokeWidth={2} />
                        {i < stages.length - 1 && <>
                            <line x1={180} y1={y + 20} x2={180} y2={y + step - 12} stroke="#81d4fa" strokeWidth={2} />
                            <text x={195} y={y + step / 2 + 3} fill="#81d4fa" fontSize={8}>{s.oilSTBD} STB/D</text>
                        </>}
                        {i === stages.length - 1 && <>
                            <line x1={180} y1={y + 20} x2={180} y2={y + 30} stroke="#81d4fa" strokeWidth={2} />
                            <text x={195} y={y + 35} fill="#81d4fa" fontSize={8}>Stock Tank: {s.oilSTBD} STB/D</text>
                        </>}
                    </g>
                );
            })}
            <text x={10} y={310} fill="#546e7a" fontSize={8}>Flash gas liberated at each pressure reduction; shrinkage ~3–8%</text>
        </svg>
    );
};

// ============================================================
// TAB 2 — CRUDE OIL TREATMENT
// ============================================================

export const CrudeTreatmentTrainSVG: React.FC<{
    stages: { name: string; bsIn: number; bsOut: number; temp: number }[];
}> = ({ stages }) => (
    <svg viewBox="0 0 700 280" style={{ width: '100%', maxWidth: 700, background: '#0f1923' }}>
        <text x={350} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Crude Oil Treatment Train — BS&W Reduction</text>
        {stages.map((s, i) => {
            const x = 50 + i * 210;
            return (
                <g key={i}>
                    <rect x={x} y={50} width={180} height={120} rx={6} fill="#1c2833" stroke="#4fc3f7" strokeWidth={1.5} />
                    <text x={x + 90} y={72} fill="#4fc3f7" fontSize={11} textAnchor="middle" fontWeight={600}>{s.name}</text>
                    <text x={x + 90} y={92} fill="#81d4fa" fontSize={10} textAnchor="middle">BS&W In: {s.bsIn}%</text>
                    <text x={x + 90} y={108} fill="#a5d6a7" fontSize={10} textAnchor="middle">BS&W Out: {s.bsOut}%</text>
                    <text x={x + 90} y={128} fill="#ff8a65" fontSize={10} textAnchor="middle">{s.temp}°F</text>
                    <text x={x + 90} y={148} fill="#78909c" fontSize={8} textAnchor="middle">Removal: {Math.round((s.bsIn - s.bsOut) / s.bsIn * 100)}%</text>
                    {i < stages.length - 1 && (
                        <line x1={x + 180} y1={110} x2={x + 210} y2={110} stroke="#4fc3f7" strokeWidth={2} markerEnd="url(#arrowBlue)" />
                    )}
                </g>
            );
        })}
        <defs>
            <marker id="arrowBlue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#4fc3f7" />
            </marker>
        </defs>
        <text x={10} y={270} fill="#546e7a" fontSize={8}>Target: BS&W {'<'} 0.5%, Salt {'<'} 10 PTB, RVP {'<'} 12 psi (pipeline spec)</text>
    </svg>
);

// ============================================================
// TAB 3 — GAS PROCESSING
// ============================================================

export const GasProcessingBFDSVG: React.FC<{
    units: { name: string; inlet: string; outlet: string; keyMetric: string }[];
}> = ({ units }) => (
    <svg viewBox="0 0 720 300" style={{ width: '100%', maxWidth: 720, background: '#0f1923' }}>
        <text x={360} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Gas Processing — Block Flow Diagram</text>
        {units.map((u, i) => {
            const x = 30 + i * 170;
            return (
                <g key={i}>
                    <rect x={x} y={50} width={150} height={120} rx={6} fill="#1c2833" stroke="#ff8a65" strokeWidth={1.5} />
                    <text x={x + 75} y={72} fill="#ff8a65" fontSize={10} textAnchor="middle" fontWeight={600}>{u.name}</text>
                    <text x={x + 75} y={92} fill="#ffd54f" fontSize={9} textAnchor="middle">{u.inlet}</text>
                    <text x={x + 75} y={108} fill="#a5d6a7" fontSize={9} textAnchor="middle">→ {u.outlet}</text>
                    <text x={x + 75} y={130} fill="#81d4fa" fontSize={8} textAnchor="middle">{u.keyMetric}</text>
                    {i < units.length - 1 && (
                        <line x1={x + 150} y1={110} x2={x + 170} y2={110} stroke="#ff8a65" strokeWidth={2} markerEnd="url(#arrowOrange)" />
                    )}
                </g>
            );
        })}
        <defs>
            <marker id="arrowOrange" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ff8a65" />
            </marker>
        </defs>
        <text x={10} y={190} fill="#546e7a" fontSize={8}>Amine Sweetening → TEG Dehydration → NGL Recovery → Sulfur Recovery</text>
        <text x={10} y={205} fill="#546e7a" fontSize={8}>Sales gas must meet tariff: H₂S {'<'} 4 ppm, CO₂ {'<'} 2%, Water {'<'} 7 lb/MMscf, HHV 950–1150 BTU/scf</text>
        {/* Sales gas spec gauge */}
        <g transform="translate(60, 230)">
            <rect x={0} y={0} width={600} height={30} rx={4} fill="#1c2833" stroke="#546e7a" strokeWidth={1} />
            {[0, 150, 300, 450].map(x => <line key={x} x1={x} y1={0} x2={x} y2={30} stroke="#546e7a" strokeWidth={0.5} />)}
            <text x={300} y={12} fill="#a5d6a7" fontSize={10} textAnchor="middle">SALES GAS SPEC: ✅ On-spec  |  ❌ Off-spec</text>
            <text x={300} y={26} fill="#78909c" fontSize={8} textAnchor="middle">Trace heating & hydrate inhibition required upstream of JT valve</text>
        </g>
    </svg>
);

// ============================================================
// TAB 4 — PRODUCED WATER MANAGEMENT
// ============================================================

export const ProducedWaterTreatmentSVG: React.FC<{
    oiwInlet: number; stages: { name: string; oiwOut: number; efficiency: number }[];
}> = ({ oiwInlet, stages }) => (
    <svg viewBox="0 0 700 280" style={{ width: '100%', maxWidth: 700, background: '#0f1923' }}>
        <text x={350} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Produced Water Treatment — OIW Reduction Cascade</text>
        {/* Inlet */}
        <rect x={20} y={40} width={100} height={40} rx={4} fill="#1c2833" stroke="#42a5f5" strokeWidth={1.5} />
        <text x={70} y={56} fill="#42a5f5" fontSize={9} textAnchor="middle">Inlet: {oiwInlet} ppm</text>
        <text x={70} y={72} fill="#78909c" fontSize={8} textAnchor="middle">OIW</text>
        {stages.map((s, i) => {
            const x = 140 + i * 170;
            const barH = Math.max(20, 100 * (s.oiwOut / (oiwInlet || 1)));
            return (
                <g key={i}>
                    <line x1={x - 20} y1={60} x2={x} y2={60} stroke="#42a5f5" strokeWidth={2} markerEnd="url(#arrowWater)" />
                    <rect x={x} y={60 - barH / 2} width={140} height={barH} rx={4} fill="#1c2833" stroke="#42a5f5" strokeWidth={1.5} />
                    <text x={x + 70} y={56 - barH / 2 + 12} fill="#42a5f5" fontSize={10} textAnchor="middle" fontWeight={600}>{s.name}</text>
                    <text x={x + 70} y={56 - barH / 2 + 28} fill="#a5d6a7" fontSize={9} textAnchor="middle">OIW: {s.oiwOut} ppm</text>
                    <text x={x + 70} y={56 - barH / 2 + 42} fill="#ff8a65" fontSize={9} textAnchor="middle">Eff: {s.efficiency}%</text>
                </g>
            );
        })}
        <defs>
            <marker id="arrowWater" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#42a5f5" />
            </marker>
        </defs>
        <text x={10} y={270} fill="#546e7a" fontSize={8}>Overboard: {'<'}40 ppm | Injection: {'<'}10 ppm | Sulfate removal membrane where BaSO₄ scaling predicted</text>
    </svg>
);

export const HallPlotSVG: React.FC<{
    hallData: { cumInjKBbl: number; hallPsiDay: number }[];
    slope: number; interpretation: string;
}> = ({ hallData, slope, interpretation }) => {
    const maxCum = Math.max(...hallData.map(d => d.cumInjKBbl), 1);
    const maxHall = Math.max(...hallData.map(d => d.hallPsiDay), 1);
    const points = hallData.map(d => `${200 + (d.cumInjKBbl / maxCum) * 400},${380 - (d.hallPsiDay / maxHall) * 320}`);
    return (
        <svg viewBox="0 0 640 420" style={{ width: '100%', maxWidth: 640, background: '#0f1923' }}>
            <text x={320} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Hall Plot — Water Injection Diagnostics</text>
            {/* Axes */}
            <line x1={200} y1={30} x2={200} y2={390} stroke="#546e7a" strokeWidth={1} />
            <line x1={200} y1={390} x2={620} y2={390} stroke="#546e7a" strokeWidth={1} />
            <text x={410} y={410} fill="#78909c" fontSize={9} textAnchor="middle">Cumulative Injection (Mbbl)</text>
            <text x={140} y={210} fill="#78909c" fontSize={9} textAnchor="middle" transform={`rotate(-90, 140, 210)`}>Hall Integral (psi·day)</text>
            {/* Data polyline */}
            <polyline points={points.join(' ')} fill="none" stroke="#4fc3f7" strokeWidth={2.5} />
            {hallData.map((d, i) => (
                <circle key={i} cx={200 + (d.cumInjKBbl / maxCum) * 400} cy={380 - (d.hallPsiDay / maxHall) * 320} r={4} fill="#4fc3f7" />
            ))}
            {/* Slope line */}
            <line x1={200} y1={380} x2={200 + (hallData[hallData.length - 1].cumInjKBbl / maxCum) * 400} y2={380 - (hallData[hallData.length - 1].hallPsiDay / maxHall) * 320}
                stroke="#ff8a65" strokeWidth={1.5} strokeDasharray="6,3" />
            <text x={500} y={60} fill="#ff8a65" fontSize={10}>Slope: {slope} psi·day/bbl</text>
            <text x={500} y={78} fill={interpretation.includes('Severe') ? '#ef5350' : interpretation.includes('Gradual') ? '#ffa726' : '#a5d6a7'} fontSize={10}>{interpretation}</text>
        </svg>
    );
};

// ============================================================
// TAB 5 — UTILITIES & POWER
// ============================================================

export const PowerOneLineSVG: React.FC<{
    generators: { type: string; kw: number; qty: number; fuel: string }[];
    totalDemandKw: number; totalGenKw: number;
}> = ({ generators, totalDemandKw, totalGenKw }) => (
    <svg viewBox="0 0 680 260" style={{ width: '100%', maxWidth: 680, background: '#0f1923' }}>
        <text x={340} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Power Generation One-Line Diagram</text>
        {generators.map((g, i) => {
            const y = 40 + i * 70;
            return (
                <g key={i}>
                    <rect x={40} y={y} width={140} height={50} rx={4} fill="#1c2833" stroke="#ff8a65" strokeWidth={1.5} />
                    <text x={110} y={y + 20} fill="#ff8a65" fontSize={10} textAnchor="middle" fontWeight={600}>{g.type}</text>
                    <text x={110} y={y + 40} fill="#78909c" fontSize={9} textAnchor="middle">{g.kw} kW × {g.qty} | {g.fuel}</text>
                    {/* Bus bar */}
                    <line x1={180} y1={y + 25} x2={320} y2={y + 25} stroke="#ffd54f" strokeWidth={2} />
                    {/* Transformer */}
                    <rect x={280} y={y + 10} width={40} height={30} rx={3} fill="none" stroke="#ffd54f" strokeWidth={1} />
                    <circle cx={290} cy={y + 17} r={3} fill="none" stroke="#ffd54f" strokeWidth={1} />
                    <circle cx={310} cy={y + 17} r={3} fill="none" stroke="#ffd54f" strokeWidth={1} />
                    <text x={300} y={y + 55} fill="#78909c" fontSize={8} textAnchor="middle">13.8 kV Bus</text>
                </g>
            );
        })}
        {/* Load */}
        <rect x={400} y={100} width={180} height={70} rx={4} fill="#1c2833" stroke="#81d4fa" strokeWidth={1.5} />
        <text x={490} y={120} fill="#81d4fa" fontSize={10} textAnchor="middle" fontWeight={600}>Total Load</text>
        <text x={490} y={138} fill="#a5d6a7" fontSize={11} textAnchor="middle">{totalDemandKw} kW connected</text>
        <text x={490} y={155} fill="#78909c" fontSize={9} textAnchor="middle">Gen Cap: {totalGenKw} kW</text>
        <line x1={320} y1={135} x2={400} y2={135} stroke="#ffd54f" strokeWidth={2} />
        {/* Summary footer */}
        <rect x={40} y={230} width={600} height={22} rx={3} fill="#1c2833" stroke="#546e7a" strokeWidth={1} />
        <text x={340} y={245} fill="#a5d6a7" fontSize={10} textAnchor="middle">
            Generation: {totalGenKw} kW | Load: {totalDemandKw} kW | Surplus: {totalGenKw - totalDemandKw} kW | Diversity: {Math.round(totalDemandKw / totalGenKw * 100)}%
        </text>
    </svg>
);

export const FlareStackSVG: React.FC<{
    tipDiaIn: number; stackHtFt: number; safeDistanceFt: number; flameLenFt: number;
}> = ({ tipDiaIn, stackHtFt, safeDistanceFt, flameLenFt }) => {
    const scaleY = 2.0;
    return (
        <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 400, background: '#0f1923' }}>
            <text x={200} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Flare Stack — API 521</text>
            {/* Grade line */}
            <line x1={10} y1={370} x2={390} y2={370} stroke="#546e7a" strokeWidth={1} />
            <text x={20} y={360} fill="#546e7a" fontSize={8}>grade</text>
            {/* Stack */}
            <rect x={194} y={370 - stackHtFt * scaleY} width={12} height={stackHtFt * scaleY} fill="#78909c" stroke="#4fc3f7" strokeWidth={1} />
            {/* Tip */}
            <rect x={185} y={370 - (stackHtFt + 5) * scaleY} width={30} height={10 * scaleY} fill="#4fc3f7" />
            <text x={220} y={370 - (stackHtFt + 5) * scaleY + 5} fill="#4fc3f7" fontSize={8}>⌀{tipDiaIn}″</text>
            {/* Flame */}
            <ellipse cx={200} cy={370 - (stackHtFt + 5 + flameLenFt / 2) * scaleY} rx={tipDiaIn * 0.6} ry={flameLenFt * scaleY / 2} fill="rgba(255,138,101,0.4)" stroke="#ff8a65" strokeWidth={1} />
            <text x={235} y={370 - (stackHtFt + 5 + flameLenFt) * scaleY} fill="#ff8a65" fontSize={9}>{flameLenFt}′ flame</text>
            {/* Safe distance arc */}
            <ellipse cx={200} cy={370} rx={safeDistanceFt * 0.5} ry={safeDistanceFt * 0.3} fill="none" stroke="#ff8a65" strokeWidth={1} strokeDasharray="4,3" />
            <text x={200 - safeDistanceFt * 0.25} y={385} fill="#ff8a65" fontSize={8}>{safeDistanceFt}′ safe distance</text>
            {/* Thermal radiation label */}
            <text x={200} y={395} fill="#ef5350" fontSize={9} textAnchor="middle">1600 BTU/hr·ft² @ grade limit</text>
        </svg>
    );
};

// ============================================================
// TAB 6 — FACILITY SAFETY
// ============================================================

export const HazardousAreaPlanSVG: React.FC<{
    zones: { classification: string; radiusFt: number; color: string }[];
}> = ({ zones }) => (
    <svg viewBox="0 0 520 360" style={{ width: '100%', maxWidth: 520, background: '#0f1923' }}>
        <text x={260} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>Hazardous Area Classification — API RP 505 (IEC 60079-10-1)</text>
        {/* Concentric zone circles */}
        {[...zones].reverse().map((z, i) => (
            <circle key={i} cx={260} cy={200} r={z.radiusFt * 2.5} fill={z.color} opacity={0.3} stroke={z.color} strokeWidth={0.5} />
        ))}
        {/* Process equipment icon */}
        <rect x={250} y={190} width={20} height={20} rx={2} fill="#4fc3f7" />
        <text x={260} y={204} fill="#fff" fontSize={8} textAnchor="middle">EQ</text>
        {/* Legend */}
        <g transform="translate(20, 300)">
            {zones.map((z, i) => (
                <g key={i} transform={`translate(0, ${i * 16})`}>
                    <rect x={0} y={0} width={14} height={10} fill={z.color} opacity={0.5} />
                    <text x={20} y={9} fill="#78909c" fontSize={8}>{z.classification} ({z.radiusFt}′ radius)</text>
                </g>
            ))}
        </g>
        <text x={10} y={352} fill="#546e7a" fontSize={8}>
            {'Ventilation: '}{zones[0].radiusFt < 8 ? 'Adequate — reduced radii' : 'Standard — mechanical ventilation recommended'}
        </text>
    </svg>
);

export const SILBarChartSVG: React.FC<{
    sifData: { function: string; currentPFD: number; targetPFD: number }[];
}> = ({ sifData }) => {
    const maxPFD = Math.max(...sifData.map(d => Math.max(d.currentPFD, d.targetPFD)), 1e-4);
    const logScale = (v: number) => -Math.log10(v) / Math.abs(Math.log10(maxPFD)) * 120;
    return (
        <svg viewBox="0 0 620 320" style={{ width: '100%', maxWidth: 620, background: '#0f1923' }}>
            <text x={310} y={18} fill="#64b5f6" fontSize={12} textAnchor="middle" fontWeight={600}>SIL Verification — PFDavg Comparison</text>
            {/* Log scale axis lines */}
            {[1e-5, 1e-4, 1e-3, 1e-2, 1e-1].map(v => (
                <text key={v} x={170 + logScale(v)} y={140} fill="#546e7a" fontSize={8} textAnchor="end">
                    {v >= 1e-2 ? v.toFixed(2) : v.toExponential(0)}
                </text>
            ))}
            {/* SIL bands */}
            <rect x={170} y={60} width={logScale(1e-4) - logScale(1e-5)} height={100} fill="rgba(165,214,167,0.15)" />
            <text x={170 + (logScale(1e-4) + logScale(1e-5)) / 2 - logScale(1e-5)} y={70} fill="#a5d6a7" fontSize={8} textAnchor="middle">SIL 3</text>
            <rect x={170 + logScale(1e-3) - logScale(1e-5)} y={60} width={logScale(1e-2) - logScale(1e-3)} height={100} fill="rgba(255,213,79,0.15)" />
            <text x={170 + (logScale(1e-2) - logScale(1e-5)) / 2 + logScale(1e-3) - logScale(1e-5)} y={70} fill="#ffd54f" fontSize={8} textAnchor="middle">SIL 2</text>
            <rect x={170 + logScale(1e-2) - logScale(1e-5)} y={60} width={logScale(1e-1) - logScale(1e-2)} height={100} fill="rgba(239,83,80,0.15)" />
            <text x={170 + logScale(1e-2) - logScale(1e-5) + (logScale(1e-1) - logScale(1e-2)) / 2} y={70} fill="#ef5350" fontSize={8} textAnchor="middle">SIL 1</text>
            {/* Bars */}
            {sifData.map((d, i) => {
                const y = 180 + i * 45;
                return (
                    <g key={i}>
                        <text x={145} y={y + 5} fill="#78909c" fontSize={8} textAnchor="end">{d.function}</text>
                        <rect x={170} y={y} width={logScale(d.currentPFD) - logScale(1e-5)} height={12} fill="#4fc3f7" />
                        <text x={175 + logScale(d.currentPFD) - logScale(1e-5)} y={y + 10} fill="#4fc3f7" fontSize={8}>Current: {d.currentPFD.toExponential(2)}</text>
                        <rect x={170} y={y + 14} width={logScale(d.targetPFD) - logScale(1e-5)} height={5} fill="#ff8a65" />
                        <text x={175 + logScale(d.targetPFD) - logScale(1e-5)} y={y + 23} fill="#ff8a65" fontSize={8}>Target: {d.targetPFD.toExponential(2)}</text>
                    </g>
                );
            })}
            <text x={10} y={312} fill="#546e7a" fontSize={8}>PFDavg target per IEC 61511: SIL 1 → {'<'}0.01, SIL 2 → {'<'}0.001, SIL 3 → {'<'}0.0001</text>
        </svg>
    );
};

// ============================================================
// DIRECTORY EXPORT (named members for tree-shake)
// ============================================================

export default {
    ThreePhaseSeparatorSVG,
    MultiStageSeparatorFlowSVG,
    CrudeTreatmentTrainSVG,
    GasProcessingBFDSVG,
    ProducedWaterTreatmentSVG,
    HallPlotSVG,
    PowerOneLineSVG,
    FlareStackSVG,
    HazardousAreaPlanSVG,
    SILBarChartSVG,
};