import React, { useState, useCallback, useMemo } from 'react';
import {
    calculateVshGR, calculateVshLarionovTertiary, calculateVshLarionovOlder,
    calculateVshSteiber, calculateVshClavier, calculateVshSP,
    calculateVshNeutronDensity, calculateVshResistivity,
    calculateDensityPorosity, calculateSonicPorosityWyllie,
    calculateSonicPorosityRHG, calculateEffectivePorosity,
    applyShaleCorrection, calculateNDCrossplotPorosity,
    calculateNeutronMatrixCorrection, calculatePorosity,
    calculateArchieSw, calculateIndonesianSw,
    calculateSaturationExponent, calculateBulkVolumeWater,
    LOGGING_TOOLS, POROSITY_TRANSFORMS
} from '../../lib/petrophysics';
import { LITHOLOGY_DATABASE, DEPOSITIONAL_ENVIRONMENTS } from '../../lib/geology';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Bar, Scatter, ReferenceLine
} from 'recharts';

// ---------- local helpers for stratigraphic & facies (not in geology.ts) ----------

interface StratColumnRow {
    depth: number;
    formation: string;
    lithology: string;
    age: string;
    thickness: number;
    topDepth: number;
    baseDepth: number;
}

function getStratigraphicColumn(wellId: string): StratColumnRow[] {
    // Returns a synthetic strat column per well (in production this would come from a database)
    if (wellId === 'WELL-1' || wellId === '') {
        return [
            { depth: 1500, formation: 'Brushy Canyon', lithology: 'Sandstone', age: 'Guadalupian', thickness: 120, topDepth: 1440, baseDepth: 1560 },
            { depth: 1700, formation: 'Cherry Canyon', lithology: 'Siltstone/Shale', age: 'Guadalupian', thickness: 180, topDepth: 1560, baseDepth: 1740 },
            { depth: 1950, formation: 'Bone Spring', lithology: 'Limestone/Dolomite', age: 'Leonardian', thickness: 250, topDepth: 1740, baseDepth: 1990 },
            { depth: 2200, formation: 'Wolfcamp A', lithology: 'Mixed Clastic-Carbonate', age: 'Wolfcampian', thickness: 300, topDepth: 1990, baseDepth: 2290 },
            { depth: 2500, formation: 'Wolfcamp B', lithology: 'Organic-rich Shale', age: 'Wolfcampian', thickness: 350, topDepth: 2290, baseDepth: 2640 },
            { depth: 2800, formation: 'Wolfcamp C', lithology: 'Carbonate Debris Flow', age: 'Wolfcampian', thickness: 400, topDepth: 2640, baseDepth: 3040 },
            { depth: 3150, formation: 'Strawn', lithology: 'Limestone', age: 'Pennsylvanian', thickness: 300, topDepth: 3040, baseDepth: 3340 },
            { depth: 3500, formation: 'Atoka', lithology: 'Shale/Sandstone', age: 'Pennsylvanian', thickness: 450, topDepth: 3340, baseDepth: 3790 },
            { depth: 3950, formation: 'Barnett', lithology: 'Siliceous Shale', age: 'Mississippian', thickness: 400, topDepth: 3790, baseDepth: 4190 },
            { depth: 4350, formation: 'Ellenburger', lithology: 'Dolomite', age: 'Ordovician', thickness: 500, topDepth: 4190, baseDepth: 4690 },
        ];
    }
    return [
        { depth: 2000, formation: 'Mishrif', lithology: 'Limestone', age: 'Cretaceous', thickness: 180, topDepth: 1910, baseDepth: 2090 },
        { depth: 2300, formation: 'Rumaila', lithology: 'Limestone/Dolomite', age: 'Cretaceous', thickness: 250, topDepth: 2090, baseDepth: 2340 },
        { depth: 2600, formation: 'Ahmadi', lithology: 'Shale', age: 'Cretaceous', thickness: 150, topDepth: 2340, baseDepth: 2490 },
        { depth: 2900, formation: 'Mauddud', lithology: 'Limestone', age: 'Cretaceous', thickness: 200, topDepth: 2490, baseDepth: 2690 },
        { depth: 3200, formation: 'Nahr Umr', lithology: 'Sandstone/Shale', age: 'Cretaceous', thickness: 300, topDepth: 2690, baseDepth: 2990 },
        { depth: 3500, formation: 'Shuaiba', lithology: 'Limestone', age: 'Cretaceous', thickness: 350, topDepth: 2990, baseDepth: 3340 },
        { depth: 3800, formation: 'Zubair', lithology: 'Sandstone', age: 'Cretaceous', thickness: 300, topDepth: 3340, baseDepth: 3640 },
        { depth: 4100, formation: 'Ratawi', lithology: 'Limestone', age: 'Cretaceous', thickness: 280, topDepth: 3640, baseDepth: 3920 },
        { depth: 4400, formation: 'Yamama', lithology: 'Limestone', age: 'Cretaceous', thickness: 350, topDepth: 3920, baseDepth: 4270 },
        { depth: 4700, formation: 'Sulaiy', lithology: 'Limestone/Anhydrite', age: 'Jurassic', thickness: 400, topDepth: 4270, baseDepth: 4670 },
    ];
}

interface FaciesInterpretation {
    depth: number;
    facies: string;
    code: number;
    color: string;
    vsh: number;
    phi: number;
}

function interpretFaciesFromLogs(logData: { depth: number; gr: number; rhob: number; nphi: number; rt: number; dt: number }[]): FaciesInterpretation[] {
    const grClean = 25;
    const grShale = 120;
    const rhoMatrix = 2.65;
    const rhoFluid = 1.0;
    const dtMatrix = 55;
    const dtFluid = 189;

    return logData.map(row => {
        let vsh = 0;
        try { vsh = calculateVshSteiber(calculateVshGR(row.gr, grClean, grShale)); } catch { vsh = 0; }
        const dphi = calculateDensityPorosity(row.rhob, rhoMatrix, rhoFluid);
        const sphi = calculateSonicPorosityWyllie(row.dt, dtMatrix, dtFluid);
        const phi = Math.max(0, (dphi + sphi) / 2);

        let facies = 'Shale';
        let code = 0;
        let color = '#8B4513';
        if (vsh < 0.15 && phi > 0.12) { facies = 'Clean Sandstone'; code = 1; color = '#FFD700'; }
        else if (vsh < 0.25 && phi > 0.06) { facies = 'Shaly Sandstone'; code = 2; color = '#DAA520'; }
        else if (vsh < 0.1 && phi < 0.06 && row.rt > 50) { facies = 'Tight Carbonate'; code = 3; color = '#1E90FF'; }
        else if (vsh < 0.2 && phi > 0.04) { facies = 'Sandy Carbonate'; code = 4; color = '#00CED1'; }
        else if (vsh >= 0.25 && vsh < 0.5) { facies = 'Silty Shale'; code = 5; color = '#A0522D'; }
        else if (vsh >= 0.5) { facies = 'Shale'; code = 0; color = '#8B4513'; }

        return { depth: row.depth, facies, code, color, vsh, phi };
    });
}

// ---------- typed log row ----------

interface LogRow {
    depth: number;
    gr: number;
    rhob: number;
    nphi: number;
    rt: number;
    dt: number;
    sp: number;
    pe: number;
    cali: number;
}

// ---------- generate synthetic well log data ----------

function generateSyntheticLogs(depthStart: number, depthEnd: number, step: number = 0.5, wellType: 'clastic' | 'carbonate' = 'clastic'): LogRow[] {
    const rows: LogRow[] = [];
    const grClean = wellType === 'carbonate' ? 10 : 25;
    const grShale = wellType === 'carbonate' ? 60 : 120;
    const rhoMatrix = wellType === 'carbonate' ? 2.71 : 2.65;
    const dtMatrix = wellType === 'carbonate' ? 47.5 : 55.5;

    for (let d = depthStart; d <= depthEnd; d += step) {
        // Simulate layered geology with transitions
        const layerCycle = Math.sin(d * 0.008) * 0.5 + 0.5; // 0-1 cyclic
        const randomJitter = () => (Math.random() - 0.5) * 0.1;

        // GR: high in shale layers, low in clean layers
        const grBase = layerCycle > 0.6 ? grShale * (0.7 + Math.random() * 0.3) : grClean * (1 + Math.random() * 1.5);
        const gr = Math.round(Math.max(grClean, Math.min(grShale, grBase)));

        // Density: high in clean (matrix), low in porous/shale
        const phiActual = layerCycle > 0.6 ? 0.02 + Math.random() * 0.04 : 0.08 + Math.random() * 0.18;
        const rhob = parseFloat((rhoMatrix - phiActual * (rhoMatrix - 1.0) + randomJitter() * 0.03).toFixed(3));

        // Neutron: tracks porosity; shale has elevated neutron
        const nphi = parseFloat((phiActual + (layerCycle > 0.6 ? 0.15 : 0) + randomJitter() * 0.02).toFixed(4));

        // Resistivity: pay zones show high Rt
        const isPay = layerCycle < 0.4 && phiActual > 0.08;
        const rtBase = isPay ? 8 + Math.random() * 60 : 1 + Math.random() * 4;
        const rt = parseFloat(rtBase.toFixed(2));

        // Sonic: Wyllie-compatible
        const dt = parseFloat((dtMatrix + phiActual * (189 - dtMatrix) + randomJitter() * 5).toFixed(1));

        // SP: deflects negative in permeable zones
        const sp = parseFloat((isPay ? -80 - Math.random() * 40 : -10 - Math.random() * 10).toFixed(1));

        // PE: 1.81 for sandstone, 5.08 for limestone
        const pe = parseFloat((wellType === 'carbonate' ? 4.5 + Math.random() * 1.5 : 1.7 + Math.random() * 0.5).toFixed(2));

        // Caliper: bit size ~8.5", washouts in shale
        const cali = parseFloat((layerCycle > 0.6 ? 9.0 + Math.random() * 3 : 8.4 + Math.random() * 0.2).toFixed(2));

        rows.push({ depth: parseFloat(d.toFixed(1)), gr, rhob, nphi, rt, dt, sp, pe, cali });
    }
    return rows;
}

// ---------- Component ----------

const FormationEvaluationModule: React.FC = () => {
    // --- state ---
    const [activeTab, setActiveTab] = useState<'wireline' | 'vsh' | 'porosity' | 'sw' | 'strat' | 'facies' | 'summary'>('wireline');
    const [wellId, setWellId] = useState('WELL-1');
    const [wellType, setWellType] = useState<'clastic' | 'carbonate'>('clastic');
    const [depthStart, setDepthStart] = useState(3000);
    const [depthEnd, setDepthEnd] = useState(3300);

    // Vsh parameters
    const [grClean, setGrClean] = useState(25);
    const [grShale, setGrShale] = useState(120);
    const [vshMethod, setVshMethod] = useState<'steiber' | 'larionov_tertiary' | 'larionov_old' | 'clavier' | 'linear'>('steiber');

    // Porosity parameters
    const [rhoMatrix, setRhoMatrix] = useState(2.65);
    const [rhoFluid, setRhoFluid] = useState(1.0);
    const [dtMatrix, setDtMatrix] = useState(55.5);
    const [dtFluid, setDtFluid] = useState(189);
    const [porosityMethod, setPorosityMethod] = useState<'density' | 'sonic_wyllie' | 'sonic_rhg' | 'nd_crossplot'>('density');

    // Sw parameters
    const [rw, setRw] = useState(0.05);
    const [a, setA] = useState(1.0);
    const [m, setM] = useState(2.0);
    const [n, setN] = useState(2.0);
    const [rsh, setRsh] = useState(3.0);
    const [swMethod, setSwMethod] = useState<'archie' | 'indonesian'>('archie');

    // --- derived log data ---
    const logs = useMemo(() => generateSyntheticLogs(depthStart, depthEnd, 0.5, wellType), [depthStart, depthEnd, wellType]);

    // --- computed curves ---
    const computed = useMemo(() => {
        return logs.map(row => {
            // Vsh
            const igr = Math.max(0, Math.min(1, (row.gr - grClean) / (grShale - grClean)));
            let vsh: number;
            switch (vshMethod) {
                case 'larionov_tertiary': vsh = calculateVshLarionovTertiary(igr); break;
                case 'larionov_old': vsh = calculateVshLarionovOlder(igr); break;
                case 'clavier': vsh = calculateVshClavier(igr); break;
                case 'linear': vsh = igr; break;
                default: vsh = calculateVshSteiber(igr);
            }
            vsh = Math.max(0, Math.min(1, vsh));

            // Porosity
            let phiTotal: number;
            switch (porosityMethod) {
                case 'sonic_wyllie': phiTotal = calculateSonicPorosityWyllie(row.dt, dtMatrix, dtFluid); break;
                case 'sonic_rhg': phiTotal = calculateSonicPorosityRHG(row.dt, dtMatrix); break;
                case 'nd_crossplot': {
                    const dp = calculateDensityPorosity(row.rhob, rhoMatrix, rhoFluid);
                    phiTotal = calculateNDCrossplotPorosity(row.nphi, dp);
                    break;
                }
                default: phiTotal = calculateDensityPorosity(row.rhob, rhoMatrix, rhoFluid);
            }
            phiTotal = Math.max(0, phiTotal);
            const phiEff = calculateEffectivePorosity(phiTotal, vsh);

            // Sw
            let sw: number;
            if (swMethod === 'indonesian') {
                sw = calculateIndonesianSw(vsh, rsh, phiEff, rw, row.rt, a, m, n);
            } else {
                sw = calculateArchieSw(a, rw, phiEff, m, row.rt, n);
            }
            sw = Math.max(0, Math.min(1, sw));

            const bvw = calculateBulkVolumeWater(phiEff, sw);
            const payFlag = vsh < 0.35 && phiEff > 0.06 && sw < 0.6;

            return { ...row, vsh, igr, phiTotal, phiEff, sw, bvw, payFlag };
        });
    }, [logs, grClean, grShale, vshMethod, rhoMatrix, rhoFluid, dtMatrix, dtFluid, porosityMethod, rw, a, m, n, rsh, swMethod]);

    // --- summary stats ---
    const summary = useMemo(() => {
        const pay = computed.filter(c => c.payFlag);
        const avgPhiEff = pay.length > 0 ? pay.reduce((s, c) => s + c.phiEff, 0) / pay.length : 0;
        const avgSw = pay.length > 0 ? pay.reduce((s, c) => s + c.sw, 0) / pay.length : 0;
        const avgVsh = pay.length > 0 ? pay.reduce((s, c) => s + c.vsh, 0) / pay.length : 0;
        const netPay = pay.length * 0.5; // 0.5 ft step
        const gross = computed.length * 0.5;
        const ntg = gross > 0 ? netPay / gross : 0;
        return { avgPhiEff, avgSw, avgVsh, netPay, gross, ntg, payCount: pay.length };
    }, [computed]);

    // --- strat column ---
    const stratColumn = useMemo(() => getStratigraphicColumn(wellId), [wellId]);

    // --- facies interpretation ---
    const faciesData = useMemo(() => interpretFaciesFromLogs(logs), [logs]);
    const faciesSummary = useMemo(() => {
        const counts: Record<string, number> = {};
        faciesData.forEach(f => { counts[f.facies] = (counts[f.facies] || 0) + 1; });
        return Object.entries(counts).map(([name, count]) => ({ name, count, pct: (count / faciesData.length * 100).toFixed(1) }));
    }, [faciesData]);

    // ===================== RENDER =====================

    const tabs: { id: typeof activeTab; label: string }[] = [
        { id: 'wireline', label: '📊 Wireline Logs' },
        { id: 'vsh', label: '🪨 Shale Volume' },
        { id: 'porosity', label: '🕳️ Porosity' },
        { id: 'sw', label: '💧 Water Saturation' },
        { id: 'strat', label: '📐 Stratigraphy' },
        { id: 'facies', label: '🔬 Facies' },
        { id: 'summary', label: '📋 Summary' },
    ];

    return (
        <div style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', background: '#0a0f1a', color: '#e0e0e0', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#60a5fa' }}>📐 Formation Evaluation & Petrophysics</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input value={wellId} onChange={e => setWellId(e.target.value)} style={inputStyle} placeholder="Well ID" />
                    <select value={wellType} onChange={e => setWellType(e.target.value as 'clastic' | 'carbonate')} style={inputStyle}>
                        <option value="clastic">Clastic Reservoir</option>
                        <option value="carbonate">Carbonate Reservoir</option>
                    </select>
                    <input type="number" value={depthStart} onChange={e => setDepthStart(+e.target.value)} style={{ ...inputStyle, width: 80 }} />
                    <span style={{ alignSelf: 'center' }}>to</span>
                    <input type="number" value={depthEnd} onChange={e => setDepthEnd(+e.target.value)} style={{ ...inputStyle, width: 80 }} />
                    <span style={{ alignSelf: 'center', color: '#94a3b8' }}>ft</span>
                </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer',
                            background: activeTab === t.id ? '#1e3a5f' : 'transparent',
                            color: activeTab === t.id ? '#60a5fa' : '#94a3b8',
                            fontWeight: activeTab === t.id ? 600 : 400,
                            fontSize: '0.85rem'
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ============ WIRELINE LOGS TAB ============ */}
            {activeTab === 'wireline' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
                        {/* GR + Caliper */}
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Gamma Ray & Caliper</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Depth (ft)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis yAxisId="left" domain={[0, 150]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'GR (API)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" domain={[6, 16]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'CALI (in)', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="gr" stroke="#f59e0b" dot={false} name="GR" strokeWidth={1.5} />
                                    <Line yAxisId="right" type="monotone" dataKey="cali" stroke="#06b6d4" dot={false} name="CALI" strokeWidth={1.5} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Resistivity */}
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Deep Resistivity (Rt)</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis domain={[0.1, 'auto']} scale="log" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Rt (ohm·m)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="rt" stroke="#ef4444" dot={false} name="Rt" strokeWidth={1.5} />
                                    <ReferenceLine y={3} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Pay cutoff', fill: '#fbbf24', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Density-Neutron */}
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Density-Neutron Overlay</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis yAxisId="left" domain={[1.8, 3.0]} reversed tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'RHOB (g/cc)', angle: -90, position: 'insideLeft', fill: '#22c55e', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 0.45]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'NPHI (v/v)', angle: 90, position: 'insideRight', fill: '#a855f7', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="rhob" stroke="#22c55e" dot={false} name="RHOB" strokeWidth={1.5} />
                                    <Line yAxisId="right" type="monotone" dataKey="nphi" stroke="#a855f7" dot={false} name="NPHI" strokeWidth={1.5} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sonic + PE */}
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Sonic & Photoelectric Factor</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis yAxisId="left" domain={[30, 140]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'DT (μs/ft)', angle: -90, position: 'insideLeft', fill: '#eab308', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 8]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'PEF (b/e)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="dt" stroke="#eab308" dot={false} name="DT" strokeWidth={1.5} />
                                    <Line yAxisId="right" type="monotone" dataKey="pe" stroke="#f97316" dot={false} name="PEF" strokeWidth={1.5} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Wireline tool reference */}
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Wireline Tool Reference</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                            {LOGGING_TOOLS.slice(0, 6).map(tool => (
                                <div key={tool.id} style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '6px', fontSize: '0.8rem' }}>
                                    <strong style={{ color: '#fbbf24' }}>{tool.acronym}</strong> — {tool.name}
                                    <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>{tool.usage}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============ SHALE VOLUME TAB ============ */}
            {activeTab === 'vsh' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px', alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>GR Clean (API)</label>
                            <input type="number" value={grClean} onChange={e => setGrClean(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>GR Shale (API)</label>
                            <input type="number" value={grShale} onChange={e => setGrShale(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Vsh Method</label>
                            <select value={vshMethod} onChange={e => setVshMethod(e.target.value as typeof vshMethod)} style={inputStyle}>
                                <option value="linear">Linear IGR</option>
                                <option value="steiber">Steiber</option>
                                <option value="larionov_tertiary">Larionov (Tertiary)</option>
                                <option value="larionov_old">Larionov (Older Rocks)</option>
                                <option value="clavier">Clavier</option>
                            </select>
                        </div>
                    </div>
                    <div style={chartCardStyle}>
                        <h4 style={chartTitleStyle}>Shale Volume Profile — Method: {vshMethod.replace(/_/g, ' ')}</h4>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Depth (ft)', position: 'insideBottom', fill: '#94a3b8' }} />
                                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Vsh (v/v)', angle: -90, position: 'insideLeft', fill: '#a16207', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => (val * 100).toFixed(1) + '%'} />
                                <Legend />
                                <ReferenceLine y={0.35} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Pay cutoff 35%', fill: '#ef4444', fontSize: 10 }} />
                                <Bar dataKey="vsh" fill="#a16207" name="Vsh" opacity={0.7} barSize={5} />
                                <Line type="monotone" dataKey="gr" stroke="#f59e0b" dot={false} name="GR" yAxisId="right" strokeWidth={1} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 150]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'GR (API)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ============ POROSITY TAB ============ */}
            {activeTab === 'porosity' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px', alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>ρ Matrix (g/cc)</label>
                            <input type="number" value={rhoMatrix} step={0.01} onChange={e => setRhoMatrix(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>ρ Fluid (g/cc)</label>
                            <input type="number" value={rhoFluid} step={0.01} onChange={e => setRhoFluid(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>ΔT Matrix (μs/ft)</label>
                            <input type="number" value={dtMatrix} step={0.1} onChange={e => setDtMatrix(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>ΔT Fluid (μs/ft)</label>
                            <input type="number" value={dtFluid} step={0.1} onChange={e => setDtFluid(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Porosity Method</label>
                            <select value={porosityMethod} onChange={e => setPorosityMethod(e.target.value as typeof porosityMethod)} style={inputStyle}>
                                <option value="density">Density Porosity</option>
                                <option value="sonic_wyllie">Sonic (Wyllie)</option>
                                <option value="sonic_rhg">Sonic (RHG)</option>
                                <option value="nd_crossplot">N-D Crossplot</option>
                            </select>
                        </div>
                    </div>
                    <div style={chartCardStyle}>
                        <h4 style={chartTitleStyle}>Porosity Profile — Method: {porosityMethod.replace(/_/g, ' ')}</h4>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis domain={[0, 0.4]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => (v * 100).toFixed(0) + '%'} label={{ value: 'Porosity (v/v)', angle: -90, position: 'insideLeft', fill: '#22c55e', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => (val * 100).toFixed(1) + '%'} />
                                <Legend />
                                <ReferenceLine y={0.06} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Pay cutoff 6%', fill: '#ef4444', fontSize: 10 }} />
                                <Bar dataKey="phiEff" fill="#22c55e" name="Phi Eff" opacity={0.6} barSize={5} />
                                <Line type="monotone" dataKey="phiTotal" stroke="#4ade80" dot={false} name="Phi Total" strokeWidth={1.5} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Porosity Transforms</h4>
                        {POROSITY_TRANSFORMS.map((pt, i) => (
                            <div key={i} style={{ padding: '0.3rem 0', fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                <strong>{pt.name}:</strong> {pt.formula} <span style={{ color: '#64748b' }}>— {pt.usage}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============ WATER SATURATION TAB ============ */}
            {activeTab === 'sw' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px', alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>Rw (ohm·m)</label>
                            <input type="number" value={rw} step={0.001} onChange={e => setRw(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>a (-)</label>
                            <input type="number" value={a} step={0.1} onChange={e => setA(+e.target.value)} style={{ ...inputStyle, width: 70 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>m (-)</label>
                            <input type="number" value={m} step={0.1} onChange={e => setM(+e.target.value)} style={{ ...inputStyle, width: 70 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>n (-)</label>
                            <input type="number" value={n} step={0.1} onChange={e => setN(+e.target.value)} style={{ ...inputStyle, width: 70 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Rsh (ohm·m)</label>
                            <input type="number" value={rsh} step={0.1} onChange={e => setRsh(+e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Sw Model</label>
                            <select value={swMethod} onChange={e => setSwMethod(e.target.value as typeof swMethod)} style={inputStyle}>
                                <option value="archie">Archie</option>
                                <option value="indonesian">Indonesian (Poupon-Leveaux)</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Water Saturation Profile — {swMethod === 'archie' ? 'Archie' : 'Indonesian'}</h4>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={computed} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => (v * 100).toFixed(0) + '%'} label={{ value: 'Sw (v/v)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => (val * 100).toFixed(1) + '%'} />
                                    <Legend />
                                    <ReferenceLine y={0.6} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Pay cutoff 60%', fill: '#ef4444', fontSize: 10 }} />
                                    <Bar dataKey="sw" fill="#3b82f6" name="Sw" opacity={0.6} barSize={5} />
                                    <Line type="monotone" dataKey="bvw" stroke="#06b6d4" dot={false} name="BVW" strokeWidth={1.5} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Archie / Indonesian formula display */}
                        <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Saturation Equation</h4>
                            {swMethod === 'archie' ? (
                                <div style={{ color: '#94a3b8', lineHeight: 1.8 }}>
                                    <div style={{ fontFamily: 'monospace', background: '#1e293b', padding: '0.75rem', borderRadius: '6px' }}>
                                        Swⁿ = (a · Rw) / (Φᵐ · Rt)
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div>Current Parameters:</div>
                                        <div>a = {a} | m = {m} | n = {n} | Rw = {rw} Ω·m</div>
                                    </div>
                                    <div style={{ marginTop: '1rem', color: '#64748b' }}>
                                        <strong>Typical Values:</strong>
                                        <ul style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>
                                            <li>Carbonates: m = 1.8–2.2, n = 2–4</li>
                                            <li>Sandstones (Humble): a = 0.62, m = 2.15, n = 2</li>
                                            <li>Unconsolidated: a = 0.81, m = 2.0, n = 2</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#94a3b8', lineHeight: 1.8 }}>
                                    <div style={{ fontFamily: 'monospace', background: '#1e293b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                                        1/√Rt = [Vsh^(1-0.5·Vsh)/√Rsh + Φ^(m/2)/√(a·Rw)] · Sw^(n/2)
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div>Current Parameters:</div>
                                        <div>a = {a} | m = {m} | n = {n} | Rw = {rw} Ω·m | Rsh = {rsh} Ω·m</div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', color: '#64748b' }}>
                                        Handles shaly sand conditions. Reduces to Archie when Vsh = 0.
                                    </div>
                                </div>
                            )}
                            {/* Saturation exponent from computed data */}
                            <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#0f172a', borderRadius: '6px' }}>
                                <strong style={{ color: '#fbbf24' }}>Saturation Exponent (n) from data:</strong>
                                {computed.filter(c => c.payFlag).slice(0, 1).map(c => {
                                    const ri = c.rt / (rw / Math.pow(c.phiEff, m));
                                    const nCalc = ri > 0 && c.sw > 0 ? calculateSaturationExponent(ri, c.sw) : 0;
                                    return <span key="n" style={{ color: '#e2e8f0', marginLeft: '0.5rem' }}>{nCalc.toFixed(2)} (from first pay zone)</span>;
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Pickett Plot */}
                    <div style={{ marginTop: '1rem' }}>
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Pickett Plot (Rt vs Φ) — Pay Zones</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={computed.filter(c => c.payFlag)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="phiEff" domain={[0.01, 'auto']} scale="log" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Φ Eff (v/v)', position: 'insideBottom', fill: '#94a3b8' }} tickFormatter={v => (v * 100).toFixed(1) + '%'} />
                                    <YAxis domain={[0.1, 'auto']} scale="log" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Rt (ohm·m)', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Scatter dataKey="phiEff" fill="#3b82f6" name="Rt vs Φ" opacity={0.6}>
                                    </Scatter>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ STRATIGRAPHY TAB ============ */}
            {activeTab === 'strat' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Stratigraphic Column — {wellId}</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#1e293b', color: '#60a5fa' }}>
                                            <th style={thStyle}>Formation</th>
                                            <th style={thStyle}>Top (ft)</th>
                                            <th style={thStyle}>Base (ft)</th>
                                            <th style={thStyle}>Thickness (ft)</th>
                                            <th style={thStyle}>Lithology</th>
                                            <th style={thStyle}>Age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stratColumn.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                                <td style={tdStyle}><strong>{row.formation}</strong></td>
                                                <td style={tdStyle}>{row.topDepth}</td>
                                                <td style={tdStyle}>{row.baseDepth}</td>
                                                <td style={tdStyle}>{row.thickness}</td>
                                                <td style={tdStyle}>{row.lithology}</td>
                                                <td style={tdStyle}>{row.age}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Lithology reference */}
                        <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                            <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Lithology Database</h4>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {LITHOLOGY_DATABASE.slice(0, 15).map((lith, i) => (
                                    <div key={i} style={{ padding: '0.35rem 0', borderBottom: '1px solid #1e293b', fontSize: '0.8rem' }}>
                                        <strong style={{ color: '#fbbf24' }}>{lith.name}</strong>
                                        <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                                            Density: {typeof lith.density === 'number' ? lith.density.toFixed(2) : lith.density} g/cc
                                            {lith.sonicDt && ` | DT: ${lith.sonicDt} μs/ft`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Depositional environments */}
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Depositional Environments</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
                            {DEPOSITIONAL_ENVIRONMENTS.map((env, i) => (
                                <div key={i} style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '6px', fontSize: '0.8rem' }}>
                                    <strong style={{ color: '#fbbf24' }}>{env.name}</strong>
                                    <div style={{ color: '#94a3b8' }}>{env.description?.slice(0, 80)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============ FACIES TAB ============ */}
            {activeTab === 'facies' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
                        <div style={chartCardStyle}>
                            <h4 style={chartTitleStyle}>Facies Interpretation from Logs</h4>
                            <ResponsiveContainer width="100%" height={450}>
                                <ComposedChart data={faciesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="depth" reversed domain={['dataMax', 'dataMin']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis domain={[0, 6]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => {
                                        const codes = ['Shale', 'Clean Sst', 'Shaly Sst', 'Tight Carb', 'Sandy Carb', 'Silty Shale'];
                                        return codes[v as number] || '';
                                    }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Scatter dataKey="code" fill="#fbbf24" name="Facies Code" opacity={0.7} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Facies summary */}
                        <div>
                            <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Facies Distribution</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#1e293b', color: '#60a5fa' }}>
                                            <th style={thStyle}>Facies</th>
                                            <th style={thStyle}>Count</th>
                                            <th style={thStyle}>%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faciesSummary.map((f, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                                <td style={{ ...tdStyle, color: '#fbbf24' }}>{f.name}</td>
                                                <td style={tdStyle}>{f.count}</td>
                                                <td style={tdStyle}>{f.pct}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* facies color legend */}
                            <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                                <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Facies Classification Rules</h4>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.8 }}>
                                    <div>🟡 <strong>Clean Sandstone:</strong> Vsh &lt; 15%, Φ &gt; 12%</div>
                                    <div>🟠 <strong>Shaly Sandstone:</strong> Vsh &lt; 25%, Φ &gt; 6%</div>
                                    <div>🔵 <strong>Tight Carbonate:</strong> Vsh &lt; 10%, Φ &lt; 6%, Rt &gt; 50 Ω·m</div>
                                    <div>🔷 <strong>Sandy Carbonate:</strong> Vsh &lt; 20%, Φ &gt; 4%</div>
                                    <div>🟤 <strong>Silty Shale:</strong> 25% ≤ Vsh &lt; 50%</div>
                                    <div>🟫 <strong>Shale:</strong> Vsh ≥ 50%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ SUMMARY TAB ============ */}
            {activeTab === 'summary' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Gross Interval', value: summary.gross.toFixed(0) + ' ft', color: '#94a3b8' },
                            { label: 'Net Pay', value: summary.netPay.toFixed(0) + ' ft', color: '#22c55e' },
                            { label: 'NTG', value: (summary.ntg * 100).toFixed(1) + '%', color: '#fbbf24' },
                            { label: 'Avg Φ Eff', value: (summary.avgPhiEff * 100).toFixed(1) + '%', color: '#4ade80' },
                            { label: 'Avg Sw', value: (summary.avgSw * 100).toFixed(1) + '%', color: '#3b82f6' },
                            { label: 'Avg Vsh', value: (summary.avgVsh * 100).toFixed(1) + '%', color: '#a16207' },
                            { label: 'Pay Zones', value: summary.payCount, color: '#f59e0b' },
                        ].map((card, i) => (
                            <div key={i} style={{ padding: '1rem', background: '#111827', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{card.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color, marginTop: '0.25rem' }}>{card.value}</div>
                            </div>
                        ))}
                    </div>
                    {/* detailed pay summary table */}
                    <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0' }}>Pay Zone Summary (Vsh &lt; 35%, Φ Eff &gt; 6%, Sw &lt; 60%)</h4>
                        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ background: '#1e293b', color: '#60a5fa', position: 'sticky', top: 0 }}>
                                        <th style={thStyle}>Depth (ft)</th>
                                        <th style={thStyle}>GR (API)</th>
                                        <th style={thStyle}>Vsh</th>
                                        <th style={thStyle}>Φ Eff</th>
                                        <th style={thStyle}>Sw</th>
                                        <th style={thStyle}>Rt (Ω·m)</th>
                                        <th style={thStyle}>BVW</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {computed.filter(c => c.payFlag).map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={tdStyle}>{row.depth}</td>
                                            <td style={tdStyle}>{row.gr}</td>
                                            <td style={{ ...tdStyle, color: row.vsh > 0.35 ? '#ef4444' : '#22c55e' }}>{(row.vsh * 100).toFixed(1)}%</td>
                                            <td style={{ ...tdStyle, color: row.phiEff < 0.06 ? '#ef4444' : '#22c55e' }}>{(row.phiEff * 100).toFixed(1)}%</td>
                                            <td style={{ ...tdStyle, color: row.sw > 0.6 ? '#ef4444' : '#22c55e' }}>{(row.sw * 100).toFixed(1)}%</td>
                                            <td style={tdStyle}>{row.rt}</td>
                                            <td style={tdStyle}>{(row.bvw * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---------- inline styles ----------

const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.85rem',
    width: 100,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginBottom: '0.2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const chartCardStyle: React.CSSProperties = {
    padding: '1rem',
    background: '#111827',
    borderRadius: '8px',
    border: '1px solid #1e293b',
};

const chartTitleStyle: React.CSSProperties = {
    color: '#60a5fa',
    margin: '0 0 0.5rem 0',
    fontSize: '0.9rem',
    fontWeight: 600,
};

const thStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    textAlign: 'left',
    borderBottom: '2px solid #334155',
    fontSize: '0.75rem',
};

const tdStyle: React.CSSProperties = {
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    color: '#cbd5e1',
};

export default FormationEvaluationModule;