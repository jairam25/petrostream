/**
 * CrudeAssayCharacterization — PHASE 6.1
 * Industrial-grade crude assay visualization with interactive TBP distillation curve,
 * whole crude property dashboard, product yield prediction, and LP valuation.
 * All calculations are editable and handle industrial-scale values.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine, Brush, ComposedChart, Area, Scatter } from 'recharts';
import { crudeAssayLibrary, type CrudeAssay, type TBPCut, TBPDistillation, specificGravityFromApi, apiFromSpecificGravity } from '../../lib/refining';

// ─── Color palette ───
const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#1e293b',
    gray: '#64748b',
    light: '#f1f5f9',
    white: '#ffffff',
    border: '#e2e8f0',
    naphtha: '#3b82f6',
    kerosene: '#8b5cf6',
    diesel: '#f59e0b',
    vgo: '#ef4444',
    residue: '#1e293b',
    sweet: '#10b981',
    sour: '#ef4444',
    medium: '#f59e0b',
};

// ─── Helper: sulfur classification color ───
function sulfurColor(s: number): string {
    if (s < 0.5) return COLORS.sweet;
    if (s <= 1.0) return COLORS.medium;
    return COLORS.sour;
}

function sulfurLabel(s: number): string {
    if (s < 0.5) return 'Sweet';
    if (s <= 1.0) return 'Medium';
    return 'Sour';
}

function tanLabel(t: number): string {
    if (t < 0.5) return 'Low TAN';
    if (t < 1.0) return 'Moderate TAN';
    if (t < 2.0) return 'High TAN';
    return 'Corrosive';
}

// ─── Component ───
export default function CrudeAssayCharacterization() {
    // ─── State ───
    const [selectedCrudeId, setSelectedCrudeId] = useState<string>(crudeAssayLibrary[0]?.id ?? '');
    const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
    const [editableParams, setEditableParams] = useState<Partial<CrudeAssay>>({});
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tbp' | 'yields' | 'comparison'>('dashboard');
    const [comparisonCrudeIds, setComparisonCrudeIds] = useState<string[]>([]);

    // ─── Derived data ───
    const baseAssay = useMemo(() => crudeAssayLibrary.find(c => c.id === selectedCrudeId) ?? crudeAssayLibrary[0], [selectedCrudeId]);
    const assay: CrudeAssay = useMemo(() => ({ ...baseAssay, ...editableParams }), [baseAssay, editableParams]);

    // TBP curve data for chart
    const tbpChartData = useMemo(() => {
        const points: { cumVolPct: number; tempF: number; sg: number; sulfur: number; fraction: string }[] = [];
        for (let v = 0; v <= 100; v += 2) {
            const tempF = TBPDistillation(assay, v);
            const sg = specificGravityFromApi(assay.apiGravity + (v > 50 ? (v - 50) * 0.15 : 0));
            const s = assay.sulfurWtPct * (0.2 + 1.6 * v / 100);
            let fraction = 'Residue';
            if (tempF < 180) fraction = 'Light Naphtha';
            else if (tempF < 300) fraction = 'Heavy Naphtha';
            else if (tempF < 430) fraction = 'Kerosene/Jet';
            else if (tempF < 550) fraction = 'Diesel';
            else if (tempF < 650) fraction = 'HGO';
            else if (tempF < 800) fraction = 'LVGO';
            else if (tempF < 1050) fraction = 'HVGO';
            points.push({ cumVolPct: v, tempF: Math.round(tempF), sg: +sg.toFixed(4), sulfur: +s.toFixed(3), fraction });
        }
        return points;
    }, [assay]);

    // TBP cuts as table rows
    const tbpCuts = useMemo(() => {
        if (assay.tbpCuts && assay.tbpCuts.length > 0) return assay.tbpCuts;
        // Generate from curve if no cuts available
        const cuts: TBPCut[] = [];
        for (let i = 0; i < 20; i++) {
            const lo = i * 5;
            const hi = (i + 1) * 5;
            const tLo = TBPDistillation(assay, lo);
            const tHi = TBPDistillation(assay, hi);
            const tMid = TBPDistillation(assay, (lo + hi) / 2);
            cuts.push({
                cutRangeF: `${Math.round(tLo)}-${Math.round(tHi)}°F`,
                initialBP_F: Math.round(tLo), finalBP_F: Math.round(tHi), midBP_F: Math.round(tMid),
                volPct: hi - lo, cumVolPct: hi,
            });
        }
        return cuts;
    }, [assay]);

    // Product yield prediction (simplified from assay)
    const productYields = useMemo(() => {
        const api = assay.apiGravity;
        const sg = specificGravityFromApi(api);
        const lightFactor = Math.max(0.5, 1 - (sg - 0.75) * 3);
        const baseRate = 100000; // bpd basis
        return {
            lightNaphtha: baseRate * 0.12 * lightFactor,
            heavyNaphtha: baseRate * 0.10 * lightFactor,
            kerosene: baseRate * 0.08 * lightFactor,
            diesel: baseRate * 0.18 * lightFactor,
            hgo: baseRate * 0.12 * lightFactor,
            atmosResidue: baseRate * Math.max(15, (1 - sg) * 180 + 15) / 100,
            gas: baseRate * 0.02 * lightFactor,
            lvgo: baseRate * 0.06 * lightFactor,
            hvgo: baseRate * 0.08 * lightFactor,
            vacResidue: baseRate * Math.max(10, (1 - sg) * 120 + 10) / 100,
        };
    }, [assay]);

    // LP valuation
    const valuation = useMemo(() => {
        const gasolinePrice = 95; // $/bbl
        const dieselPrice = 105;
        const jetPrice = 100;
        const fuelOilPrice = 65;
        const lpgPrice = 45;
        const py = productYields;
        const totalVol = py.lightNaphtha + py.heavyNaphtha + py.kerosene + py.diesel + py.hgo + py.atmosResidue + py.gas;
        const revenue = (py.lightNaphtha + py.heavyNaphtha) * gasolinePrice * 0.9 + py.kerosene * jetPrice + py.diesel * dieselPrice + py.atmosResidue * fuelOilPrice + (py.lvgo + py.hvgo) * (dieselPrice * 0.7 + jetPrice * 0.3) + py.vacResidue * fuelOilPrice * 0.7;
        const crudeCost = totalVol * assay.crudeCost;
        const opex = totalVol * 4.5;
        const margin = revenue - crudeCost - opex;
        return {
            totalVolumeBpd: Math.round(totalVol),
            grossRevenue: Math.round(revenue),
            crudeCost: Math.round(crudeCost),
            opex: Math.round(opex),
            margin: Math.round(margin),
            marginPerBbl: totalVol > 0 ? +(margin / totalVol).toFixed(2) : 0,
        };
    }, [assay, productYields]);

    // Comparison data
    const comparisonAssays = useMemo(() => comparisonCrudeIds.map(id => crudeAssayLibrary.find(c => c.id === id)).filter(Boolean) as CrudeAssay[], [comparisonCrudeIds]);

    // ─── Handlers ───
    const handleParamChange = useCallback((field: keyof CrudeAssay, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setEditableParams(prev => ({ ...prev, [field]: num }));
        }
    }, []);

    const toggleComparisonCrude = useCallback((id: string) => {
        setComparisonCrudeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev);
    }, []);

    // ─── Render helpers ───
    const InfoCard = ({ label, value, unit, color, tooltip }: { label: string; value: string | number; unit?: string; color?: string; tooltip?: string }) => (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow" title={tooltip}>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-bold" style={{ color: color ?? COLORS.dark }}>{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit ?? ''}</span></div>
        </div>
    );

    const ParamInput = ({ label, value, unit, field, tooltip }: { label: string; value: number; unit: string; field: keyof CrudeAssay; tooltip?: string }) => (
        <div className="flex items-center justify-between py-1.5 px-3 hover:bg-slate-50 rounded" title={tooltip}>
            <span className="text-sm text-slate-600">{label}</span>
            <div className="flex items-center gap-1">
                {editMode === 'edit' ? (
                    <input type="number" value={value} onChange={e => handleParamChange(field, e.target.value)}
                        className="w-24 text-right text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        step={field === 'apiGravity' ? 0.1 : field === 'sulfurWtPct' ? 0.01 : 0.1} />
                ) : (
                    <span className="text-sm font-semibold text-slate-800">{typeof value === 'number' ? value.toFixed(field === 'sulfurWtPct' ? 2 : 1) : value}</span>
                )}
                <span className="text-xs text-slate-400 w-12">{unit}</span>
            </div>
        </div>
    );

    // ─── TBP Chart tooltip ───
    const TBPChartTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const p = payload[0]?.payload;
        return (
            <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-3 text-sm">
                <div className="font-semibold text-slate-800">Cumulative Vol: {label}%</div>
                <div className="text-indigo-600 font-bold">Boiling Point: {p?.tempF}°F</div>
                <div className="text-slate-500">SG: {p?.sg?.toFixed?.(4)}</div>
                <div className="text-slate-500">Sulfur: {p?.sulfur?.toFixed?.(3)} wt%</div>
                <div className="text-slate-500">Fraction: {p?.fraction}</div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Header with crude selector ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Crude Oil Assay & Characterization</h2>
                    <p className="text-sm text-slate-500 mt-1">PHASE 6.1 — TBP distillation, whole crude properties, product yield prediction</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={selectedCrudeId} onChange={e => { setSelectedCrudeId(e.target.value); setEditableParams({}); }}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 min-w-[220px]">
                        {crudeAssayLibrary.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                        ))}
                    </select>
                    <button onClick={() => setEditMode(m => m === 'edit' ? 'view' : 'edit')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editMode === 'edit' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'}`}>
                        {editMode === 'edit' ? '✓ Editing Parameters' : '✎ Edit Parameters'}
                    </button>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="flex border-b border-slate-200 gap-1">
                {(['dashboard', 'tbp', 'yields', 'comparison'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        {tab === 'dashboard' ? '📊 Assay Dashboard' : tab === 'tbp' ? '🌡️ TBP Curve' : tab === 'yields' ? '📈 Product Yields' : '⚖️ Crude Comparison'}
                    </button>
                ))}
            </div>

            {/* ═══════════════════════════════════════════ ASSAY DASHBOARD TAB ═══════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Crude Identity */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-5 text-white">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-xl font-bold">{assay.name} ({assay.id})</h3>
                                <p className="text-indigo-200 text-sm mt-1">{assay.origin}</p>
                                <p className="text-indigo-300 text-xs mt-2 max-w-xl">{assay.description}</p>
                            </div>
                            <div className="flex gap-3 text-right">
                                <div>
                                    <div className="text-3xl font-bold">{assay.apiGravity.toFixed(1)}</div>
                                    <div className="text-indigo-200 text-xs">°API Gravity</div>
                                </div>
                                <div className="border-l border-indigo-500 pl-3">
                                    <div className="text-3xl font-bold" style={{ color: sulfurColor(assay.sulfurWtPct) === COLORS.sweet ? '#6ee7b7' : sulfurColor(assay.sulfurWtPct) === COLORS.medium ? '#fcd34d' : '#fca5a5' }}>{assay.sulfurWtPct.toFixed(2)}</div>
                                    <div className="text-indigo-200 text-xs">Sulfur (wt%) — {sulfurLabel(assay.sulfurWtPct)}</div>
                                </div>
                                <div className="border-l border-indigo-500 pl-3">
                                    <div className="text-xl font-bold">${assay.crudeCost}</div>
                                    <div className="text-indigo-200 text-xs">Landed Cost ($/bbl)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Whole Crude Properties Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <InfoCard label="API Gravity" value={assay.apiGravity.toFixed(1)} unit="°API" tooltip="141.5/SG − 131.5 — higher = lighter crude" />
                        <InfoCard label="Sulfur" value={assay.sulfurWtPct.toFixed(2)} unit="wt%" color={sulfurColor(assay.sulfurWtPct)} tooltip={`${sulfurLabel(assay.sulfurWtPct)} crude`} />
                        <InfoCard label="TAN" value={assay.tan.toFixed(2)} unit="mg KOH/g" color={assay.tan > 1 ? COLORS.danger : assay.tan > 0.5 ? COLORS.warning : COLORS.success} tooltip={`${tanLabel(assay.tan)} — naphthenic acid corrosion risk`} />
                        <InfoCard label="Nitrogen" value={assay.nitrogenWtPct.toFixed(3)} unit="wt%" tooltip="Organic nitrogen — catalyst poison in downstream units" />
                        <InfoCard label="Ni + V" value={`${assay.nickelPpm.toFixed(1)}+${assay.vanadiumPpm.toFixed(1)}`} unit="ppm" tooltip="Nickel + Vanadium — FCC/HC catalyst poisons, concentrate in residue" />
                        <InfoCard label="CCR" value={assay.ccrWtPct.toFixed(1)} unit="wt%" tooltip={`Conradson Carbon Residue — coke precursor (${assay.ccrWtPct > 5 ? 'High coking tendency' : 'Normal'})`} />
                        <InfoCard label="Asphaltenes" value={assay.asphalteneWtPct.toFixed(1)} unit="wt%" tooltip="n-Heptane insolubles — emulsion stabilizer, coke precursor" />
                        <InfoCard label="Salt" value={assay.saltPTB.toFixed(0)} unit="PTB" tooltip="lb salt / 1000 bbl crude — removed in desalter" />
                        <InfoCard label="Pour Point" value={assay.pourPointF.toFixed(0)} unit="°F" tooltip="Lowest temperature at which crude flows" />
                        <InfoCard label="RVP" value={assay.rvpPsi.toFixed(1)} unit="psi" tooltip="Reid Vapor Pressure — light ends content/inventory loss indicator" />
                        <InfoCard label="Visc @ 100°F" value={assay.viscosityCST_100F.toFixed(1)} unit="cSt" tooltip="Kinematic viscosity — affects pumping, heat transfer, desalting" />
                        <InfoCard label="BS&W" value={assay.bsAndWVolPct.toFixed(2)} unit="vol%" tooltip="Basic Sediment & Water — removed in desalter/tank settling" />
                    </div>

                    {/* Editable Parameters Panel */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h4 className="font-semibold text-slate-700 mb-3">{editMode === 'edit' ? '✏️ Editing Assay Parameters (changes reflected in all calculations)' : '📋 Assay Parameters (click Edit to modify)'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                            <ParamInput label="API Gravity" value={assay.apiGravity} unit="°API" field="apiGravity" tooltip="API gravity: 141.5/SG − 131.5" />
                            <ParamInput label="Sulfur" value={assay.sulfurWtPct} unit="wt%" field="sulfurWtPct" tooltip="Total sulfur content in weight percent" />
                            <ParamInput label="TAN" value={assay.tan} unit="mg KOH/g" field="tan" tooltip="Total Acid Number — naphthenic acids" />
                            <ParamInput label="Nitrogen" value={assay.nitrogenWtPct} unit="wt%" field="nitrogenWtPct" tooltip="Total nitrogen content" />
                            <ParamInput label="Nickel" value={assay.nickelPpm} unit="ppm" field="nickelPpm" tooltip="Nickel content ppm wt" />
                            <ParamInput label="Vanadium" value={assay.vanadiumPpm} unit="ppm" field="vanadiumPpm" tooltip="Vanadium content ppm wt" />
                            <ParamInput label="CCR" value={assay.ccrWtPct} unit="wt%" field="ccrWtPct" tooltip="Conradson Carbon Residue" />
                            <ParamInput label="Asphaltenes" value={assay.asphalteneWtPct} unit="wt%" field="asphalteneWtPct" tooltip="C7 asphaltene content" />
                            <ParamInput label="Salt" value={assay.saltPTB} unit="PTB" field="saltPTB" tooltip="Salt content lb/1000 bbl" />
                            <ParamInput label="Crude Cost" value={assay.crudeCost} unit="$/bbl" field="crudeCost" tooltip="Delivered cost at refinery gate" />
                        </div>
                    </div>

                    {/* Quick LP Valuation */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-3">💰 Quick LP Valuation (100,000 BPD basis)</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            <InfoCard label="Crude Rate" value={(valuation.totalVolumeBpd / 1000).toFixed(1)} unit="MBPD" />
                            <InfoCard label="Product Revenue" value={`$${(valuation.grossRevenue / 1e6).toFixed(1)}M`} unit="/day" color={COLORS.success} />
                            <InfoCard label="Crude Cost" value={`$${(valuation.crudeCost / 1e6).toFixed(1)}M`} unit="/day" color={COLORS.danger} />
                            <InfoCard label="OPEX" value={`$${(valuation.opex / 1e6).toFixed(1)}M`} unit="/day" color={COLORS.warning} />
                            <InfoCard label="Gross Margin" value={`$${valuation.marginPerBbl.toFixed(2)}`} unit="/bbl" color={valuation.margin > 0 ? COLORS.success : COLORS.danger} />
                        </div>
                        <div className="mt-3 text-xs text-emerald-600">
                            Margin = Σ(product yields × product prices) − crude cost − $4.50/bbl OPEX. Edit crude cost above to update.
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ TBP CURVE TAB ═══════════════════════════════════════════ */}
            {activeTab === 'tbp' && (
                <div className="space-y-6">
                    {/* TBP Distillation Curve — Interactive Chart */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-800">True Boiling Point (TBP) Distillation Curve</h3>
                                <p className="text-xs text-slate-500 mt-1">ASTM D2892 / D5236 — Cumulative yield vs. boiling temperature</p>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> {assay.name}</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={tbpChartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="cumVolPct" label={{ value: 'Cumulative Volume (%)', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" label={{ value: 'Boiling Point (°F)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} domain={[0, 'dataMax + 100']} />
                                <YAxis yAxisId="right" orientation="right" label={{ value: 'Specific Gravity', angle: 90, position: 'insideRight' }} tick={{ fontSize: 12 }} domain={[0.6, 1.1]} />
                                <Tooltip content={<TBPChartTooltip />} />
                                <Legend />
                                {/* Fraction zones as colored areas */}
                                <ReferenceLine yAxisId="left" x={12} stroke={COLORS.naphtha} strokeWidth={30} strokeOpacity={0.08} />
                                <ReferenceLine yAxisId="left" x={22} stroke={COLORS.kerosene} strokeWidth={30} strokeOpacity={0.08} />
                                <ReferenceLine yAxisId="left" x={40} stroke={COLORS.diesel} strokeWidth={30} strokeOpacity={0.08} />
                                <ReferenceLine yAxisId="left" x={60} stroke={COLORS.vgo} strokeWidth={30} strokeOpacity={0.08} />
                                {/* TBP Curve */}
                                <Area yAxisId="left" type="monotone" dataKey="tempF" stroke={COLORS.primary} fill={`url(#tbpGradient)`} strokeWidth={2.5} dot={false} name="Boiling Point" />
                                <defs>
                                    <linearGradient id="tbpGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                {/* SG dots */}
                                <Scatter yAxisId="right" dataKey="sg" fill={COLORS.warning} name="Specific Gravity" opacity={0.6} />
                                {/* Fraction zone labels */}
                                <ReferenceLine yAxisId="left" y={200} stroke={COLORS.naphtha} strokeDasharray="5 5" label={{ value: 'Naphtha', position: 'right', fill: COLORS.naphtha, fontSize: 10 }} />
                                <ReferenceLine yAxisId="left" y={430} stroke={COLORS.kerosene} strokeDasharray="5 5" label={{ value: 'Kerosene/Jet', position: 'right', fill: COLORS.kerosene, fontSize: 10 }} />
                                <ReferenceLine yAxisId="left" y={550} stroke={COLORS.diesel} strokeDasharray="5 5" label={{ value: 'Diesel', position: 'right', fill: COLORS.diesel, fontSize: 10 }} />
                                <ReferenceLine yAxisId="left" y={650} stroke={COLORS.vgo} strokeDasharray="5 5" label={{ value: 'HGO/VGO', position: 'right', fill: COLORS.vgo, fontSize: 10 }} />
                                <ReferenceLine yAxisId="left" y={1050} stroke={COLORS.residue} strokeDasharray="5 5" label={{ value: 'Residue', position: 'right', fill: COLORS.residue, fontSize: 10 }} />
                                <Brush dataKey="cumVolPct" height={25} stroke={COLORS.primary} fill={COLORS.light} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* TBP Cut Data Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">TBP Cut Data Table</h3>
                            <p className="text-xs text-slate-500">20 narrow-boiling fractions — 5 vol% each. Cut points, properties, and PONA classification.</p>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-100 text-slate-600">
                                    <tr>
                                        <th className="text-left px-3 py-2">Cut Range</th>
                                        <th className="text-right px-3 py-2">IBP (°F)</th>
                                        <th className="text-right px-3 py-2">FBP (°F)</th>
                                        <th className="text-right px-3 py-2">Mid-BP (°F)</th>
                                        <th className="text-right px-3 py-2">Vol%</th>
                                        <th className="text-right px-3 py-2">Cum Vol%</th>
                                        <th className="text-right px-3 py-2">SG</th>
                                        <th className="text-right px-3 py-2">°API</th>
                                        <th className="text-right px-3 py-2">Sulfur</th>
                                        <th className="text-right px-3 py-2">Nitrogen</th>
                                        <th className="text-right px-3 py-2">Ni</th>
                                        <th className="text-right px-3 py-2">V</th>
                                        <th className="text-left px-3 py-2">PONA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tbpCuts.map((cut, idx) => {
                                        const isLight = cut.midBP_F < 300;
                                        const isMid = cut.midBP_F >= 300 && cut.midBP_F < 600;
                                        const isHeavy = cut.midBP_F >= 600;
                                        return (
                                            <tr key={idx} className={`border-t border-slate-100 hover:bg-slate-50 ${isLight ? 'bg-blue-50/30' : isMid ? 'bg-amber-50/30' : 'bg-slate-100/50'}`}>
                                                <td className="px-3 py-1.5 font-medium text-slate-700">{cut.cutRangeF}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.initialBP_F}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.finalBP_F}</td>
                                                <td className="px-3 py-1.5 text-right font-semibold">{cut.midBP_F}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.volPct}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.cumVolPct}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.specificGravity?.toFixed(4) ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.api?.toFixed(1) ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.sulfurWtPct?.toFixed(3) ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.nitrogenPpm ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.nickelPpm?.toFixed(1) ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{cut.vanadiumPpm?.toFixed(1) ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-xs text-slate-500">{cut.pona ?? '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sulfur Distribution Curve */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Sulfur Distribution Across Boiling Range</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={tbpChartData.filter((_, i) => i % 5 === 0)} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="cumVolPct" label={{ value: 'Cumulative Volume (%)', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
                                <YAxis label={{ value: 'Sulfur (wt%)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: number) => [`${v.toFixed(3)} wt%`, 'Sulfur']} labelFormatter={(l: number) => `Cum Vol: ${l}%`} />
                                <Bar dataKey="sulfur" fill={COLORS.warning} radius={[4, 4, 0, 0]} name="Sulfur Content" />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-slate-500 mt-2">Sulfur concentrates in heavier fractions — higher boiling point = exponentially higher sulfur content.</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ PRODUCT YIELDS TAB ═══════════════════════════════════════════ */}
            {activeTab === 'yields' && (
                <div className="space-y-6">
                    {/* Product Yield Bar Chart */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Estimated Product Yields from Crude Distillation</h3>
                        <p className="text-xs text-slate-500 mb-4">Based on API gravity-cut yield correlation. 100,000 BPD basis. Actual yields depend on furnace outlet temperature and cut points.</p>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={[
                                { name: 'Light Naphtha', bpd: Math.round(productYields.lightNaphtha), fill: '#3b82f6', category: 'Naphtha' },
                                { name: 'Heavy Naphtha', bpd: Math.round(productYields.heavyNaphtha), fill: '#6366f1', category: 'Naphtha' },
                                { name: 'Kerosene/Jet', bpd: Math.round(productYields.kerosene), fill: '#8b5cf6', category: 'Middle Distillate' },
                                { name: 'Diesel', bpd: Math.round(productYields.diesel), fill: '#f59e0b', category: 'Middle Distillate' },
                                { name: 'HGO', bpd: Math.round(productYields.hgo), fill: '#ef4444', category: 'Heavy' },
                                { name: 'LVGO', bpd: Math.round(productYields.lvgo), fill: '#dc2626', category: 'VGO' },
                                { name: 'HVGO', bpd: Math.round(productYields.hvgo), fill: '#b91c1c', category: 'VGO' },
                                { name: 'Atm Residue', bpd: Math.round(productYields.atmosResidue), fill: '#475569', category: 'Residue' },
                                { name: 'Vac Residue', bpd: Math.round(productYields.vacResidue), fill: '#1e293b', category: 'Residue' },
                                { name: 'Gas', bpd: Math.round(productYields.gas), fill: '#94a3b8', category: 'Gas' },
                            ]} margin={{ top: 10, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={0} height={80} />
                                <YAxis label={{ value: 'Barrels Per Day', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} BPD`, 'Volume']} />
                                <Bar dataKey="bpd" radius={[4, 4, 0, 0]}>
                                    {[
                                        { name: 'Light Naphtha', bpd: Math.round(productYields.lightNaphtha), fill: '#3b82f6' },
                                        { name: 'Heavy Naphtha', bpd: Math.round(productYields.heavyNaphtha), fill: '#6366f1' },
                                        { name: 'Kerosene/Jet', bpd: Math.round(productYields.kerosene), fill: '#8b5cf6' },
                                        { name: 'Diesel', bpd: Math.round(productYields.diesel), fill: '#f59e0b' },
                                        { name: 'HGO', bpd: Math.round(productYields.hgo), fill: '#ef4444' },
                                        { name: 'LVGO', bpd: Math.round(productYields.lvgo), fill: '#dc2626' },
                                        { name: 'HVGO', bpd: Math.round(productYields.hvgo), fill: '#b91c1c' },
                                        { name: 'Atm Residue', bpd: Math.round(productYields.atmosResidue), fill: '#475569' },
                                        { name: 'Vac Residue', bpd: Math.round(productYields.vacResidue), fill: '#1e293b' },
                                        { name: 'Gas', bpd: Math.round(productYields.gas), fill: '#94a3b8' },
                                    ].map((entry, index) => (
                                        <rect key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Yield Summary Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                                <h4 className="font-semibold text-blue-800 text-sm">Light & Middle Distillates</h4>
                            </div>
                            <table className="w-full text-sm">
                                <tbody>
                                    {[
                                        { name: 'Light Naphtha (C5-180°F)', bpd: productYields.lightNaphtha, pct: productYields.lightNaphtha / 100000 * 100, price: 90 },
                                        { name: 'Heavy Naphtha (180-300°F)', bpd: productYields.heavyNaphtha, pct: productYields.heavyNaphtha / 100000 * 100, price: 85 },
                                        { name: 'Kerosene/Jet (300-430°F)', bpd: productYields.kerosene, pct: productYields.kerosene / 100000 * 100, price: 100 },
                                        { name: 'Diesel (430-550°F)', bpd: productYields.diesel, pct: productYields.diesel / 100000 * 100, price: 105 },
                                    ].map(y => (
                                        <tr key={y.name} className="border-t border-slate-100">
                                            <td className="px-3 py-2 text-slate-700">{y.name}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{Math.round(y.bpd).toLocaleString()} BPD</td>
                                            <td className="px-3 py-2 text-right text-slate-500">{y.pct.toFixed(1)}%</td>
                                            <td className="px-3 py-2 text-right text-emerald-600">${y.price}/bbl</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                                <h4 className="font-semibold text-slate-700 text-sm">Heavy Fractions & Residue</h4>
                            </div>
                            <table className="w-full text-sm">
                                <tbody>
                                    {[
                                        { name: 'HGO (550-650°F)', bpd: productYields.hgo, pct: productYields.hgo / 100000 * 100, price: 75 },
                                        { name: 'LVGO (650-800°F)', bpd: productYields.lvgo, pct: productYields.lvgo / 100000 * 100, price: 70 },
                                        { name: 'HVGO (800-1050°F)', bpd: productYields.hvgo, pct: productYields.hvgo / 100000 * 100, price: 65 },
                                        { name: 'Atm Residue (>1050°F)', bpd: productYields.atmosResidue, pct: productYields.atmosResidue / 100000 * 100, price: 40 },
                                        { name: 'Vac Residue', bpd: productYields.vacResidue, pct: productYields.vacResidue / 100000 * 100, price: 30 },
                                    ].map(y => (
                                        <tr key={y.name} className="border-t border-slate-100">
                                            <td className="px-3 py-2 text-slate-700">{y.name}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{Math.round(y.bpd).toLocaleString()} BPD</td>
                                            <td className="px-3 py-2 text-right text-slate-500">{y.pct.toFixed(1)}%</td>
                                            <td className="px-3 py-2 text-right text-amber-600">${y.price}/bbl</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Value Staircase */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h3 className="font-semibold text-slate-800 mb-3">Product Value Staircase — $/bbl by Fraction</h3>
                        <div className="flex items-end gap-1 h-32">
                            {[
                                { label: 'Gas', value: 20, color: '#94a3b8', width: 8 },
                                { label: 'Vac Res', value: 30, color: '#1e293b', width: 8 },
                                { label: 'Atm Res', value: 40, color: '#475569', width: 8 },
                                { label: 'HVGO', value: 65, color: '#b91c1c', width: 8 },
                                { label: 'LVGO', value: 70, color: '#dc2626', width: 8 },
                                { label: 'HGO', value: 75, color: '#ef4444', width: 8 },
                                { label: 'Diesel', value: 105, color: '#f59e0b', width: 8 },
                                { label: 'Jet', value: 100, color: '#8b5cf6', width: 8 },
                                { label: 'Hvy Naph', value: 85, color: '#6366f1', width: 8 },
                                { label: 'Lt Naph', value: 90, color: '#3b82f6', width: 8 },
                            ].map((item, i) => (
                                <div key={item.label} className="flex flex-col items-center" style={{ width: `${item.width}%` }}>
                                    <span className="text-xs font-semibold text-slate-700 mb-1">${item.value}</span>
                                    <div className="w-full rounded-t" style={{ height: `${item.value / 105 * 100}%`, backgroundColor: item.color, minHeight: '8px' }}></div>
                                    <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Illustrative product values relative to crude cost (${assay.crudeCost}/bbl). The value uplift from upgrading heavy fractions (VGO → gasoline/diesel via FCC/HC) is the economic driver of conversion units.</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ CRUDE COMPARISON TAB ═══════════════════════════════════════════ */}
            {activeTab === 'comparison' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {crudeAssayLibrary.map(c => (
                            <button key={c.id} onClick={() => toggleComparisonCrude(c.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${comparisonCrudeIds.includes(c.id) ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}>
                                {c.name} ({c.id})
                            </button>
                        ))}
                    </div>

                    {comparisonAssays.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <div className="text-4xl mb-3">⚖️</div>
                            <p>Select up to 4 crudes above to compare their properties</p>
                        </div>
                    )}

                    {comparisonAssays.length > 0 && (
                        <>
                            {/* Comparison Spider/Radar Data Table */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-800">Property Comparison Matrix</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-slate-600">Property</th>
                                                {comparisonAssays.map(c => (
                                                    <th key={c.id} className="text-right px-4 py-2 font-semibold text-slate-700">{c.name}<br /><span className="text-xs text-slate-400">({c.id})</span></th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { label: 'API Gravity', key: 'apiGravity' as const, unit: '°API', format: (v: number) => v.toFixed(1), higher: true },
                                                { label: 'Sulfur', key: 'sulfurWtPct' as const, unit: 'wt%', format: (v: number) => v.toFixed(2), higher: false },
                                                { label: 'TAN', key: 'tan' as const, unit: 'mg KOH/g', format: (v: number) => v.toFixed(2), higher: false },
                                                { label: 'Nitrogen', key: 'nitrogenWtPct' as const, unit: 'wt%', format: (v: number) => v.toFixed(3), higher: false },
                                                { label: 'CCR', key: 'ccrWtPct' as const, unit: 'wt%', format: (v: number) => v.toFixed(1), higher: false },
                                                { label: 'Asphaltenes', key: 'asphalteneWtPct' as const, unit: 'wt%', format: (v: number) => v.toFixed(1), higher: false },
                                                { label: 'Ni + V', key: 'nickelPpm' as const, unit: 'ppm', format: (v: number, c: CrudeAssay) => `${c.nickelPpm.toFixed(1)}+${c.vanadiumPpm.toFixed(1)}`, higher: false },
                                                { label: 'Salt', key: 'saltPTB' as const, unit: 'PTB', format: (v: number) => v.toFixed(0), higher: false },
                                                { label: 'Pour Point', key: 'pourPointF' as const, unit: '°F', format: (v: number) => v.toFixed(0), higher: false },
                                                { label: 'Crude Cost', key: 'crudeCost' as const, unit: '$/bbl', format: (v: number) => `$${v.toFixed(0)}`, higher: false },
                                            ].map(row => {
                                                const values = comparisonAssays.map(c => c[row.key]);
                                                const bestIdx = row.higher ? values.indexOf(Math.max(...values)) : values.indexOf(Math.min(...values));
                                                return (
                                                    <tr key={row.label} className="border-t border-slate-100 hover:bg-slate-50">
                                                        <td className="px-4 py-2 text-slate-600 font-medium">{row.label}</td>
                                                        {comparisonAssays.map((c, idx) => (
                                                            <td key={c.id} className={`px-4 py-2 text-right ${idx === bestIdx && comparisonAssays.length > 1 ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'}`}>
                                                                {row.format(c[row.key] as number, c)}{idx === bestIdx && comparisonAssays.length > 1 ? ' ★' : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* TBP curve comparison */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <h3 className="font-semibold text-slate-800 mb-4">TBP Curve Comparison</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="cumVolPct" label={{ value: 'Cumulative Volume (%)', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} type="number" domain={[0, 100]} />
                                        <YAxis label={{ value: 'Boiling Point (°F)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(v: number) => [v.toFixed(0) + '°F', 'Boiling Point']} labelFormatter={(l: number) => `Cum Vol: ${l}%`} />
                                        <Legend />
                                        {comparisonAssays.map((c, idx) => {
                                            const data = Array.from({ length: 51 }, (_, i) => ({
                                                cumVolPct: i * 2,
                                                tempF: TBPDistillation(c, i * 2),
                                            }));
                                            const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b'];
                                            return (
                                                <Line key={c.id} data={data} type="monotone" dataKey="tempF" name={`${c.name}`}
                                                    stroke={colors[idx % colors.length]} strokeWidth={2.5} dot={false} />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Value Comparison */}
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <h3 className="font-semibold text-slate-800 mb-3">Relative Crude Value Comparison</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={comparisonAssays.map(c => {
                                        const sg = specificGravityFromApi(c.apiGravity);
                                        const lightFactor = Math.max(0.5, 1 - (sg - 0.75) * 3);
                                        const py = {
                                            lightNaphtha: 12 * lightFactor, heavyNaphtha: 10 * lightFactor,
                                            kerosene: 8 * lightFactor, diesel: 18 * lightFactor,
                                            residue: Math.max(15, (1 - sg) * 180 + 15),
                                            vgo: 6 * lightFactor + 8 * lightFactor,
                                        };
                                        const revenue = (py.lightNaphtha + py.heavyNaphtha) * 90 + py.kerosene * 100 + py.diesel * 105 + py.residue * 40 + py.vgo * 68;
                                        return { name: c.name, revenue: +revenue.toFixed(0), cost: c.crudeCost, margin: +(revenue - c.crudeCost - 4.5).toFixed(0) };
                                    })} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis label={{ value: '$/bbl', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Product Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="cost" name="Crude Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="margin" name="Net Margin" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-xs text-slate-500 mt-3">Gross product value minus crude cost and $4.50/bbl OPEX. Complex refineries can process lower-cost heavy/sour crudes and still capture margin through conversion units.</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Key Equations Reference Footer ── */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                <div className="font-semibold text-slate-700 mb-2">📐 Key Equations Used</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div><code>API = 141.5/SG − 131.5</code> — Gravity classification</div>
                    <div><code>Sulfur class: Sweet {'<'}0.5%, Medium 0.5-1.0%, Sour {'>'}1.0%</code></div>
                    <div><code>TBP Cut Yield = f(API, SG, T50, T100)</code> — Riazi-Daubert correlation</div>
                    <div><code>Naphtha Yield ∝ Light Factor = 1 − (SG − 0.75)×3</code></div>
                    <div><code>Residue Yield% = max(15, (1−SG)×180 + 15)</code></div>
                    <div><code>Margin = Σ(Yield_i × Price_i) − Crude Cost − OPEX</code></div>
                </div>
            </div>
        </div>
    );
}