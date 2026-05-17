import React, { useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, ComposedChart, Area, ScatterChart, Scatter,
    ReferenceLine, Label, Cell, PieChart, Pie, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    viscosityIndex, baseOilGroup, solventDewaxing, asphaltBlendIndex,
    baseOilVIFromComposition, waxCrystallization, asphaltPenetrationVsTemp,
    lubeVIBlend, asphaltPGGrade, waxCrystallizationModel, asphaltPGGradePrediction,
    additiveFormulation, apiGravity, sgFromAPI
} from '../../lib/refining';
import type { RefineryConfig, RefinerySimResult } from '../../lib/refining';

// ────────────────────────────────────────
// Helpers
// ────────────────────────────────────────
const fmt = (v: number, d: number = 2) => {
    if (!isFinite(v)) return 'N/A';
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const pct = (v: number) => fmt(v, 1) + '%';
const fmtMoney = (v: number) => {
    if (!isFinite(v)) return 'N/A';
    if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(2);
};

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#84cc16'];

// ────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-2">
            <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-text-secondary uppercase">{subtitle}</p>
        </div>
    );
}

function DataRow({ label, value, unit, precision = 2, source }: {
    label: string; value: string; unit: string; precision?: number; source?: string;
}) {
    return (
        <div className="flex justify-between items-center text-[10px] py-0.5">
            <span className="text-text-secondary uppercase">{label}</span>
            <span className="flex items-center gap-1">
                <span className="text-industry-value data-mono font-medium">{value}</span>
                <span className="text-[11px] text-text-muted">{unit}</span>
                {source && <span className="text-[10px] text-amber-400/70">({source})</span>}
            </span>
        </div>
    );
}

function InputWithSlider({ label, value, min, max, step, unit, source, onChange }: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; source: string; onChange: (v: number) => void;
}) {
    return (
        <div className="mb-2">
            <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-muted">{source}</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="flex-1 h-1 accent-brand-primary"
                />
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={e => onChange(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-elevated-bg border border-border-subtle rounded px-2 py-0.5 text-[10px] text-industry-value data-mono text-right"
                />
                <span className="text-[11px] text-text-muted w-8">{unit}</span>
            </div>
        </div>
    );
}

// ────────────────────────────────────────
// VI Blend Nomograph Chart
// ────────────────────────────────────────
function VIBlendNomograph({ baseOils }: { baseOils: { name: string; volPct: number; vi: number; kv100: number }[] }) {
    const total = baseOils.reduce((s, b) => s + b.volPct, 0);
    const data = baseOils.map(b => ({
        name: b.name,
        '% Volume': total > 0 ? (b.volPct / total) * 100 : 0,
        'VI': b.vi,
        'KV100 (cSt)': b.kv100,
    }));
    if (total > 0 && baseOils.length >= 2) {
        const blend = lubeVIBlend(baseOils.map(b => ({ volPct: b.volPct, vi: b.vi, kv100Cst: b.kv100 })));
        data.push({
            name: 'BLEND',
            '% Volume': 100,
            'VI': blend.blendVI,
            'KV100 (cSt)': blend.blendKV100,
        });
    }
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 'auto']} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="VI" fill="#8b5cf6" name="VI" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="right" dataKey="KV100 (cSt)" fill="#06b6d4" name="KV100" radius={[2, 2, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ────────────────────────────────────────
// Asphalt PG Grade Chart
// ────────────────────────────────────────
function AsphaltPGGradeChart({ penetration, softeningPointF, viscosity60C }: {
    penetration: number; softeningPointF: number; viscosity60C: number;
}) {
    const grades = useMemo(() => {
        const softeningPointC = (softeningPointF - 32) * 5 / 9;
        const result = asphaltPGGrade(penetration, softeningPointC, viscosity60C);
        // Generate PG grade range visualization
        const pgData = [];
        const basePG = result.pgGrade;
        const highVal = result.highTempGradeC;
        const lowVal = result.lowTempGradeC;
        for (let h = Math.max(46, highVal - 16); h <= Math.min(88, highVal + 16); h += 6) {
            for (let l = -10; l >= -46; l -= 6) {
                const matches = Math.abs(h - highVal) <= 6 && Math.abs(l - lowVal) <= 6;
                pgData.push({ high: h, low: l, z: matches ? 1 : 0.05, isTarget: h === highVal && l === lowVal });
            }
        }
        return { result, pgData };
    }, [penetration, softeningPointF, viscosity60C]);

    const targetPoints = grades.pgData.filter(d => d.isTarget || d.z === 1);
    const lowTempLabels = grades.pgData.filter(d => d.z === 1).map(d => Math.abs(d.low));

    return (
        <div className="relative">
            <div className="text-[11px] text-brand-primary font-bold mb-1 text-center">PG Grade: {grades.result.pgGrade}</div>
            <div className="text-[10px] text-text-secondary mb-1 text-center">
                High Temp: {grades.result.highTempGradeC}°C | Low Temp: −{Math.abs(grades.result.lowTempGradeC)}°C
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" dataKey="high" name="High Temp °C" tick={{ fontSize: 8, fill: '#94a3b8' }}
                        domain={[46, 82]} label={{ value: 'High Temp Grade (°C)', position: 'bottom', fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis type="number" dataKey="low" name="Low Temp °C" tick={{ fontSize: 8, fill: '#94a3b8' }}
                        domain={[-46, -10]} label={{ value: 'Low Temp Grade (°C)', angle: -90, position: 'left', fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 9 }}
                        formatter={(val: number, name: string) => [name === 'high' ? `${val}°C` : `−${Math.abs(val)}°C`, name === 'high' ? 'High Temp' : 'Low Temp']} />
                    {targetPoints.length > 0 && (
                        <Scatter data={targetPoints} fill="#f59e0b" stroke="#fbbf24" shape="star" name="Target Grade" />
                    )}
                </ScatterChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-text-muted text-center mt-1">
                {grades.result.suitableForClimate}
            </div>
        </div>
    );
}

// ────────────────────────────────────────
// Wax Crystallization Curve
// ────────────────────────────────────────
function WaxCrystallizationCurve({ waxContent, solventRatio, filtrationTempC, coolingRate }: {
    waxContent: number; solventRatio: number; filtrationTempC: number; coolingRate: number;
}) {
    const curveData = useMemo(() => {
        const data = [];
        for (let t = 20; t >= -40; t -= 2) {
            const result = waxCrystallizationModel(waxContent, solventRatio, t, coolingRate);
            data.push({
                temp: t,
                yield: result.waxYieldWtPct,
                oilInWax: result.oilInWaxPct,
                filterRate: result.filterRateKgHrM2,
            });
        }
        return data;
    }, [waxContent, solventRatio, coolingRate]);

    return (
        <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={curveData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="temp" tick={{ fontSize: 8, fill: '#94a3b8' }}
                    label={{ value: 'Temp (°C)', position: 'bottom', fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 8, fill: '#94a3b8' }} domain={[0, 'auto']}
                    label={{ value: 'Yield %', angle: -90, position: 'left', fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8, fill: '#94a3b8' }}
                    label={{ value: 'O/W%', angle: 90, position: 'right', fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 9 }} />
                <Area yAxisId="left" type="monotone" dataKey="yield" stroke="#8b5cf6" fill="#8b5cf633" name="Wax Yield %" />
                <Line yAxisId="right" type="monotone" dataKey="oilInWax" stroke="#ef4444" dot={false} name="Oil in Wax %" strokeWidth={1.5} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

// ────────────────────────────────────────
// Base Oil Group Radar
// ────────────────────────────────────────
function BaseOilGroupRadar({ saturates, sulfur, vi }: { saturates: number; sulfur: number; vi: number }) {
    const data = [
        { property: 'Saturates %', value: saturates, fullMark: 100 },
        { property: 'VI', value: Math.min(vi, 160), fullMark: 160 },
        { property: 'Low Sulfur', value: (1 - sulfur * 2) * 100, fullMark: 100 },
        { property: 'Oxidation Stab.', value: saturates * 0.9, fullMark: 100 },
        { property: 'Volatility', value: Math.max(0, 100 - vi * 0.4), fullMark: 100 },
        { property: 'Yield', value: saturates * 0.75, fullMark: 100 },
    ];
    return (
        <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="property" tick={{ fontSize: 7, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 7, fill: '#64748b' }} domain={[0, 100]} />
                <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf644" fillOpacity={0.5} name="Base Oil" />
            </RadarChart>
        </ResponsiveContainer>
    );
}

// ────────────────────────────────────────
// Additive Formulation Pie
// ────────────────────────────────────────
function AdditiveFormulationPie({ baseVI, targetVI, pourPoint, targetPour }: {
    baseVI: number; targetVI: number; pourPoint: number; targetPour: number;
}) {
    const result = useMemo(() => additiveFormulation(baseVI, pourPoint, 100, targetVI, targetPour, 'Medium'), [baseVI, targetVI, pourPoint, targetPour]);
    const data = [
        { name: 'Base Oil', value: 100 - result.viiTreatRateWtPct - result.ppdTreatRateWtPct, fill: '#8b5cf6' },
        { name: 'VII', value: result.viiTreatRateWtPct, fill: '#f59e0b' },
        { name: 'PPD', value: result.ppdTreatRateWtPct, fill: '#06b6d4' },
        { name: 'Detergent/Other', value: result.detergentTreatRateWtPct || 5, fill: '#10b981' },
    ].filter(d => d.value > 0);
    return (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        labelLine={{ stroke: '#64748b', strokeWidth: 0.5 }}>
                        {data.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 9 }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-text-muted text-center">
                VII: {result.viiTreatRateWtPct.toFixed(1)}% | PPD: {result.ppdTreatRateWtPct.toFixed(1)}%
            </div>
        </div>
    );
}

// ────────────────────────────────────────
// Asphalt Blend Optimization Chart
// ────────────────────────────────────────
function AsphaltBlendChart({ components }: { components: { name: string; penetration: number; volPct: number }[] }) {
    const blend = useMemo(() => asphaltBlendIndex(components.map(c => ({ volPct: c.volPct, penetration: c.penetration }))), [components]);
    const data = components.map(c => ({ ...c, 'Penetration (0.1mm)': c.penetration, '%': c.volPct }));
    return (
        <div>
            <div className="text-[11px] text-emerald-400 font-bold text-center mb-1">
                Blend Penetration: {blend.toFixed(0)} (0.1mm)
            </div>
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fontSize: 8, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8' }} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 9 }} />
                    <Bar dataKey="Penetration (0.1mm)" fill="#f59e0b" radius={[0, 2, 2, 0]}>
                        {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ────────────────────────────────────────
// Penetration vs Temperature Curve
// ────────────────────────────────────────
function PenetrationVsTempCurve({ penetrationAt25, softeningPointF = 120 }: { penetrationAt25: number; softeningPointF?: number }) {
    const data = useMemo(() => {
        const pts = [];
        for (let t = 0; t <= 60; t += 5) {
            const pen = asphaltPenetrationVsTemp(penetrationAt25, softeningPointF, t * 9/5 + 32);
            pts.push({ temp: t, penetration: pen.penetrationAtTemp });
        }
        return pts;
    }, [penetrationAt25, softeningPointF]);
    return (
        <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="temp" tick={{ fontSize: 8, fill: '#94a3b8' }}
                    label={{ value: 'Temperature (°C)', position: 'bottom', fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} domain={[0, 'auto']}
                    label={{ value: 'Pen. (0.1mm)', angle: -90, position: 'left', fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: 9 }} />
                <Line type="monotone" dataKey="penetration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Penetration" />
                <ReferenceLine y={penetrationAt25} stroke="#ef4444" strokeDasharray="5 5" label={<Label value="25°C Ref" position="right" style={{ fontSize: 8, fill: '#ef4444' }} />} />
            </LineChart>
        </ResponsiveContainer>
    );
}

// ══════════════════════════════════════════════════════════════
// MAIN MODULE
// ══════════════════════════════════════════════════════════════
export default function LubeOilSpecialtyModule({ config, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    // 6.9.1 — Lube Base Oil
    const [kv40, setKv40] = useState(150);
    const [kv100, setKv100] = useState(14.5);
    const [saturates, setSaturates] = useState(92);
    const [sulfPct, setSulfPct] = useState(0.02);
    const [vgoFeedBpd, setVgoFeedBpd] = useState(15000);
    const [paraffinsPct, setParaffinsPct] = useState(65);
    const [naphthenesPct, setNaphthenesPct] = useState(25);
    const [aromaticsPct, setAromaticsPct] = useState(10);

    // 6.9.2 — Wax
    const [feedPour, setFeedPour] = useState(80);
    const [targetPour, setTargetPour] = useState(-5);
    const [solventRatio, setSolventRatio] = useState(3.0);
    const [filtrationTempC, setFiltrationTempC] = useState(-15);
    const [coolingRateCPm, setCoolingRateCPm] = useState(2.0);
    const [waxContentWt, setWaxContentWt] = useState(18);

    // 6.9.3 — Asphalt
    const [penetration, setPenetration] = useState(150);
    const [airRate, setAirRate] = useState(500);
    const [softeningPointF, setSofteningPointF] = useState(120);
    const [viscosity60C, setViscosity60C] = useState(2000);
    const [asphaltFeedBpd, setAsphaltFeedBpd] = useState(8000);

    // 6.9.4 — Petrochemical
    const [propylenePurity, setPropylenePurity] = useState(95);
    const [btxRecovery, setBtxRecovery] = useState(92);
    const [paraxyleneRecovery, setParaxyleneRecovery] = useState(88);

    // VI Blend components
    const [blendOils, setBlendOils] = useState([
        { name: 'SN150', volPct: 30, vi: 95, kv100: 5.5 },
        { name: 'SN500', volPct: 40, vi: 90, kv100: 11.0 },
        { name: 'Bright Stock', volPct: 30, vi: 85, kv100: 32.0 },
    ]);

    // Asphalt blend components
    const [asphaltComponents, setAsphaltComponents] = useState([
        { name: 'VR Straight', penetration: 180, volPct: 55 },
        { name: 'Air Blown', penetration: 45, volPct: 30 },
        { name: 'Flux Oil', penetration: 300, volPct: 15 },
    ]);

    // ── DERIVED CALCULATIONS ──
    const results = useMemo(() => {
        // Base oil calculations
        const vi = viscosityIndex(kv40, kv100);
        const group = baseOilGroup(saturates, sulfPct, vi);
        const viFromComp = baseOilVIFromComposition(paraffinsPct, naphthenesPct, aromaticsPct, 400);
        const dewaxing = solventDewaxing(vgoFeedBpd, feedPour, targetPour, solventRatio);

        // Wax crystallization model
        const waxCrystal = waxCrystallizationModel(waxContentWt, solventRatio, filtrationTempC, coolingRateCPm);
        const waxBasic = waxCrystallization(waxContentWt, filtrationTempC, coolingRateCPm, solventRatio * 0.7);

        // Asphalt
        const pgGrade = asphaltPGGrade(penetration, (softeningPointF - 32) * 5 / 9, viscosity60C);
        const pgDetailed = asphaltPGGradePrediction(penetration, softeningPointF, viscosity60C, 0, 1.0);

        // Asphalt blend
        const blendResult = asphaltBlendIndex(asphaltComponents.map(c => ({
            volPct: c.volPct,
            penetration: c.penetration,
        })));

        // VI Blend
        const viBlend = lubeVIBlend(blendOils.map(b => ({
            volPct: b.volPct,
            vi: b.vi,
            kv100Cst: b.kv100,
        })));

        // Additive formulation
        const additive = additiveFormulation(vi, targetPour, kv100, Math.max(vi + 10, 120), -10, 'Medium');

        // Penetration curve key points
        const penAt40C = asphaltPenetrationVsTemp(penetration, softeningPointF, 40 * 9/5 + 32);
        const penAt60C = asphaltPenetrationVsTemp(penetration, softeningPointF, 60 * 9/5 + 32);

        // Revenue estimates
        const lubeRevenue = vgoFeedBpd * (vi > 100 ? 110 : 85) * 365;
        const waxRevenue = dewaxing.waxProductBpd * 75 * 365;
        const asphaltRevenue = asphaltFeedBpd * (penetration < 50 ? 65 : 45) * 365;
        const petrochemRevenue = (config?.crudeRateBpd || 100000) * 0.05 * 120 * 365;

        // Group-specific data display
        const groupInfo = {
            'Group I': { color: '#94a3b8', description: 'Solvent-refined, <90% saturates, >0.03% S' },
            'Group II': { color: '#06b6d4', description: 'Hydroprocessed, ≥90% saturates, ≤0.03% S' },
            'Group III': { color: '#8b5cf6', description: 'Severe hydroprocessing, ≥90% sat, ≤0.03% S, VI≥120' },
            'Group IV': { color: '#f59e0b', description: 'PAO synthetic, top performance' },
            'Group V': { color: '#ef4444', description: 'All other (esters, PAGs, naphthenic, etc.)' },
        };

        return {
            vi, group, viFromComp, dewaxing, waxCrystal, waxBasic,
            pgGrade, pgDetailed, blendResult, viBlend, additive,
            penAt40C, penAt60C, lubeRevenue, waxRevenue, asphaltRevenue, petrochemRevenue,
            groupInfo,
        };
    }, [kv40, kv100, saturates, sulfPct, vgoFeedBpd, paraffinsPct, naphthenesPct, aromaticsPct,
        feedPour, targetPour, solventRatio, filtrationTempC, coolingRateCPm, waxContentWt,
        penetration, airRate, softeningPointF, viscosity60C, asphaltFeedBpd,
        propylenePurity, btxRecovery, paraxyleneRecovery,
        blendOils, asphaltComponents, config]);

    return (
        <div className="space-y-4">
            {/* ── Row 1: Base Oil + Wax ── */}
            <div className="grid grid-cols-2 gap-4">
                {/* 6.9.1 Lube Base Oil */}
                <div className="bg-elevated-bg/40 border border-border-subtle rounded p-3">
                    <SectionHeader title="6.9.1 Lube Base Oil Production" subtitle="VI, Group classification, solvent extraction" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputWithSlider label="KV40" value={kv40} min={20} max={500} step={1} unit="cSt" source="ASTM D445" onChange={setKv40} />
                            <InputWithSlider label="KV100" value={kv100} min={2} max={50} step={0.1} unit="cSt" source="ASTM D445" onChange={setKv100} />
                            <InputWithSlider label="Saturates" value={saturates} min={50} max={99} step={0.5} unit="%" source="ASTM D2007" onChange={setSaturates} />
                            <InputWithSlider label="Sulfur" value={sulfPct} min={0.001} max={0.5} step={0.001} unit="%" source="ASTM D2622" onChange={setSulfPct} />
                            <InputWithSlider label="VGO Feed" value={vgoFeedBpd} min={1000} max={50000} step={500} unit="BPD" source="Lube VDU" onChange={setVgoFeedBpd} />
                        </div>
                        <div>
                            <div className="space-y-1 mb-2">
                                <DataRow label="Viscosity Index" value={results.vi.toFixed(0)} unit="VI" precision={0} />
                                <DataRow label="Base Oil Group" value={results.group} unit="-" precision={0} />
                                <DataRow label="VI (from Comp.)" value={results.viFromComp.predictedVI.toFixed(0)} unit="VI" precision={0} />
                                <DataRow label="Dewaxed Oil" value={fmt(results.dewaxing.dewaxedOilBpd, 0)} unit="BPD" precision={0} />
                                <DataRow label="Wax Yield" value={pct(results.dewaxing.waxYieldWtPct)} unit="(wt%)" precision={1} />
                                <div className="mt-1 pt-1 border-t border-border-subtle">
                                    <DataRow label="Lube Revenue" value={fmtMoney(results.lubeRevenue)} unit="$/YR" precision={0} />
                                </div>
                            </div>
                            <div className="text-[10px] text-text-muted mt-1">
                                <span style={{ color: (results.groupInfo as any)[results.group]?.color }}>
                                    {(results.groupInfo as any)[results.group]?.description}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <BaseOilGroupRadar saturates={saturates} sulfur={sulfPct} vi={results.vi} />
                    </div>
                </div>

                {/* 6.9.2 Wax Processing */}
                <div className="bg-elevated-bg/40 border border-border-subtle rounded p-3">
                    <SectionHeader title="6.9.2 Wax Processing & Crystallization" subtitle="Dewaxing thermodynamics & kinetics" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputWithSlider label="Feed Pour Point" value={feedPour} min={30} max={140} step={1} unit="°F" source="Wax crude" onChange={setFeedPour} />
                            <InputWithSlider label="Target Pour" value={targetPour} min={-40} max={40} step={1} unit="°F" source="Spec" onChange={setTargetPour} />
                            <InputWithSlider label="Solvent Ratio" value={solventRatio} min={1} max={6} step={0.1} unit="vol:vol" source="MEK/Tol" onChange={setSolventRatio} />
                            <InputWithSlider label="Filtration Temp" value={filtrationTempC} min={-30} max={10} step={1} unit="°C" source="Chiller" onChange={setFiltrationTempC} />
                            <InputWithSlider label="Cooling Rate" value={coolingRateCPm} min={0.5} max={5} step={0.1} unit="°C/min" source="HX" onChange={setCoolingRateCPm} />
                            <InputWithSlider label="Wax Content" value={waxContentWt} min={5} max={35} step={0.5} unit="wt%" source="Feed" onChange={setWaxContentWt} />
                        </div>
                        <div>
                            <div className="space-y-1 mb-2">
                                <DataRow label="Wax Yield" value={pct(results.waxCrystal.waxYieldWtPct)} unit="(wt%)" precision={1} />
                                <DataRow label="Oil in Wax" value={pct(results.waxCrystal.oilInWaxPct)} unit="(%)" precision={1} />
                                <DataRow label="Dewaxed Oil Yield" value={pct(results.waxCrystal.dewaxedOilYieldVolPct)} unit="(vol%)" precision={1} />
                                <DataRow label="Result Pour Point" value={results.waxCrystal.pourPointC.toFixed(0)} unit="°C" precision={0} />
                                <DataRow label="Filter Rate" value={results.waxCrystal.filterRateKgHrM2.toFixed(1)} unit="kg/hr/m²" precision={1} />
                                <DataRow label="Wax Revenue" value={fmtMoney(results.waxRevenue)} unit="$/YR" precision={0} />
                            </div>
                        </div>
                    </div>
                    <WaxCrystallizationCurve waxContent={waxContentWt} solventRatio={solventRatio}
                        filtrationTempC={filtrationTempC} coolingRate={coolingRateCPm} />
                </div>
            </div>

            {/* ── Row 2: Asphalt + Petrochemical ── */}
            <div className="grid grid-cols-2 gap-4">
                {/* 6.9.3 Asphalt / Bitumen */}
                <div className="bg-elevated-bg/40 border border-border-subtle rounded p-3">
                    <SectionHeader title="6.9.3 Asphalt / Bitumen Production" subtitle="Air blowing, PG grading, blend optimization" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputWithSlider label="Penetration @25°C" value={penetration} min={10} max={300} step={1} unit="0.1mm" source="Feed" onChange={setPenetration} />
                            <InputWithSlider label="Air Rate" value={airRate} min={100} max={1500} step={10} unit="SCFM" source="Blowing" onChange={setAirRate} />
                            <InputWithSlider label="Softening Point" value={softeningPointF} min={90} max={200} step={1} unit="°F" source="R&B" onChange={setSofteningPointF} />
                            <InputWithSlider label="Viscosity @60°C" value={viscosity60C} min={500} max={10000} step={100} unit="Poise" source="DSR" onChange={setViscosity60C} />
                            <InputWithSlider label="Asphalt Feed" value={asphaltFeedBpd} min={1000} max={30000} step={500} unit="BPD" source="VR" onChange={setAsphaltFeedBpd} />
                        </div>
                        <div>
                            <div className="space-y-1 mb-2">
                                <DataRow label="Pen @40°C" value={results.penAt40C.penetrationAtTemp.toFixed(1)} unit="0.1mm" precision={1} />
                                <DataRow label="Pen @60°C" value={results.penAt60C.penetrationAtTemp.toFixed(1)} unit="0.1mm" precision={1} />
                                <DataRow label="PG Grade" value={results.pgGrade.pgGrade} unit="-" precision={0} />
                                <DataRow label="High Temp" value={results.pgGrade.highTempGradeC.toFixed(0)} unit="°C" precision={0} />
                                <DataRow label="Low Temp" value={'−' + Math.abs(results.pgGrade.lowTempGradeC).toFixed(0)} unit="°C" precision={0} />
                                <DataRow label="Blend Pen." value={results.blendResult.toFixed(0)} unit="0.1mm" precision={0} />
                                <DataRow label="Asphalt Revenue" value={fmtMoney(results.asphaltRevenue)} unit="$/YR" precision={0} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <AsphaltPGGradeChart penetration={penetration} softeningPointF={softeningPointF} viscosity60C={viscosity60C} />
                        <PenetrationVsTempCurve penetrationAt25={penetration} softeningPointF={softeningPointF} />
                    </div>
                    <div className="mt-2">
                        <AsphaltBlendChart components={asphaltComponents} />
                    </div>
                </div>

                {/* 6.9.4 Petrochemical + VI Blend */}
                <div className="bg-elevated-bg/40 border border-border-subtle rounded p-3">
                    <SectionHeader title="6.9.3b Asphalt Blending & 6.9.4 Petrochemical Feedstocks" subtitle="Multi-component asphalt & petrochemical integration" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-[11px] text-text-secondary font-bold mb-1">Asphalt Blend Components</div>
                            {asphaltComponents.map((c, i) => (
                                <InputWithSlider key={i} label={c.name + ' Pen.'} value={c.penetration} min={5} max={350} step={1} unit="0.1mm" source="Grade"
                                    onChange={v => {
                                        const updated = [...asphaltComponents];
                                        updated[i] = { ...updated[i], penetration: v };
                                        setAsphaltComponents(updated);
                                    }} />
                            ))}
                            <InputWithSlider label="Penetration Index" value={penetration} min={-5} max={5} step={0.1} unit="PI" source="Calc" onChange={setPenetration} />
                        </div>
                        <div>
                            <div className="text-[11px] text-text-secondary font-bold mb-1">Petrochemical Yields</div>
                            <InputWithSlider label="Propylene Purity" value={propylenePurity} min={60} max={99.9} step={0.1} unit="%" source="Splitter" onChange={setPropylenePurity} />
                            <InputWithSlider label="BTX Recovery" value={btxRecovery} min={50} max={99} step={1} unit="%" source="Aromatics" onChange={setBtxRecovery} />
                            <InputWithSlider label="p-Xylene Rec." value={paraxyleneRecovery} min={50} max={99} step={1} unit="%" source="Parex" onChange={setParaxyleneRecovery} />
                            <div className="space-y-1 mt-2">
                                <DataRow label="Petrochem Revenue" value={fmtMoney(results.petrochemRevenue)} unit="$/YR" precision={0} />
                                <DataRow label="Propylene Grade" value={propylenePurity >= 99.5 ? 'Polymer' : propylenePurity >= 95 ? 'Chemical' : 'Refinery'} unit="-" precision={0} />
                            </div>
                        </div>
                    </div>

                    {/* VI Blend Section */}
                    <div className="mt-3 border-t border-border-subtle pt-2">
                        <div className="text-[11px] text-brand-primary font-bold mb-1">VI Blending (Multi-Component)</div>
                        <div className="grid grid-cols-3 gap-2">
                            {blendOils.map((oil, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-[11px] font-bold text-text-secondary">{oil.name}</div>
                                    <input type="number" value={oil.volPct} min={0} max={100}
                                        onChange={e => {
                                            const updated = [...blendOils];
                                            updated[i] = { ...updated[i], volPct: parseFloat(e.target.value) || 0 };
                                            setBlendOils(updated);
                                        }}
                                        className="w-full bg-elevated-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-industry-value data-mono text-center mb-1" />
                                    <input type="number" value={oil.vi} min={0} max={200}
                                        onChange={e => {
                                            const updated = [...blendOils];
                                            updated[i] = { ...updated[i], vi: parseFloat(e.target.value) || 0 };
                                            setBlendOils(updated);
                                        }}
                                        className="w-full bg-elevated-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-industry-value data-mono text-center mb-0.5" />
                                    <div className="text-[10px] text-text-muted">VI: {oil.vi}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                            <DataRow label="Blend VI" value={results.viBlend.blendVI.toFixed(0)} unit="VI" precision={0} />
                            <DataRow label="Blend KV100" value={results.viBlend.blendKV100.toFixed(1)} unit="cSt" precision={1} />
                            <DataRow label="SAE Grade" value={results.viBlend.saeGrade} unit="-" precision={0} />
                            <DataRow label="Group" value={results.viBlend.groupClassification} unit="-" precision={0} />
                        </div>
                    </div>

                    {/* Additive Formulation */}
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <div className="text-[11px] text-text-secondary font-bold">Additive Formulation</div>
                            <AdditiveFormulationPie baseVI={results.vi} targetVI={Math.max(results.vi + 10, 120)}
                                pourPoint={targetPour} targetPour={-10} />
                            <div className="text-[10px] text-text-muted text-center">
                                VII + PPD + Detergent Package
                            </div>
                        </div>
                        <VIBlendNomograph baseOils={blendOils} />
                    </div>
                </div>
            </div>

            {/* ── Row 3: Economic Summary ── */}
            <div className="grid grid-cols-4 gap-3 bg-elevated-bg/30 border border-border-subtle rounded p-3">
                <div className="text-center">
                    <div className="text-[11px] text-text-secondary uppercase">Lube Oil Revenue</div>
                    <div className="text-sm font-bold text-emerald-400 data-mono">{fmtMoney(results.lubeRevenue)}</div>
                    <div className="text-[10px] text-text-muted">Per Year</div>
                </div>
                <div className="text-center">
                    <div className="text-[11px] text-text-secondary uppercase">Wax Revenue</div>
                    <div className="text-sm font-bold text-emerald-400 data-mono">{fmtMoney(results.waxRevenue)}</div>
                    <div className="text-[10px] text-text-muted">Per Year</div>
                </div>
                <div className="text-center">
                    <div className="text-[11px] text-text-secondary uppercase">Asphalt Revenue</div>
                    <div className="text-sm font-bold text-emerald-400 data-mono">{fmtMoney(results.asphaltRevenue)}</div>
                    <div className="text-[10px] text-text-muted">Per Year</div>
                </div>
                <div className="text-center">
                    <div className="text-[11px] text-text-secondary uppercase">Petrochem Revenue</div>
                    <div className="text-sm font-bold text-emerald-400 data-mono">{fmtMoney(results.petrochemRevenue)}</div>
                    <div className="text-[10px] text-text-muted">Per Year</div>
                </div>
            </div>
        </div>
    );
}