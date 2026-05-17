import React, { useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, ComposedChart, Area, Scatter,
    ReferenceLine, Label, RadialBarChart, RadialBar
} from 'recharts';
import {
    fccYields, hydrocrackerYields, cokerYields, visbreakerConversion, sdaDAOYield,
    fccHeatBalance, fccEcatActivity, cokerDrumCycle, fccRiserKinetics,
    hydrocrackerDeactivation, cokerDrumCycleOptimization, fccRegeneratorHeatBalance,
    fccCatalystDeactivation, cokerCycleAnalysis, hydrocrackerCatalystLife,
    fccFourLumpKinetics, sgFromAPI, apiGravity
} from '../../lib/refining';

// ────────────────────────────────────────
// Helpers
// ────────────────────────────────────────
const fmt = (v: number, d: number = 2) => {
    if (!isFinite(v)) return 'N/A';
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtInt = (v: number) => fmt(v, 0);
const pct = (v: number) => fmt(v, 1) + '%';

// ────────────────────────────────────────
// Color palette
// ────────────────────────────────────────
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────
type CokeType = 'fuel' | 'anode' | 'needle';
type SolventType = 'propane' | 'butane' | 'pentane';
type HydrocrackerMode = 'once-through' | 'recycle';
type VisbreakerType = 'coil' | 'soaker';
type FCCMode = 'max-gasoline' | 'max-olefins' | 'max-diesel' | 'custom';

interface ConversionState {
    // FCC
    fccFeedRateBpd: number;
    fccFeedApi: number;
    fccFeedSulfurWtPct: number;
    fccFeedCCRWtPct: number;
    fccRiserOutletF: number;
    fccCatToOil: number;
    fccZsm5WtPct: number;
    fccFeedMetalsNiVppm: number;
    fccMode: FCCMode;
    // Hydrocracker
    hcFeedRateBpd: number;
    hcFeedApi: number;
    hcFeedSulfurWtPct: number;
    hcFeedNitrogenPpm: number;
    hcReactorTempF: number;
    hcPressurePsig: number;
    hcLhsv: number;
    hcMode: HydrocrackerMode;
    hcOperatingDays: number;
    hcStartOfRunTempF: number;
    hcEndOfRunTempF: number;
    hcTempRampRateFPMonth: number;
    // Coker
    cokerFeedRateBpd: number;
    cokerFeedApi: number;
    cokerFeedCCRWtPct: number;
    cokerFeedSulfurWtPct: number;
    cokerDrumTempF: number;
    cokerDrumPressurePsig: number;
    cokerRecycleRatio: number;
    cokerCokeType: CokeType;
    cokerFillHr: number;
    cokerSteamHr: number;
    cokerQuenchHr: number;
    cokerDrainHr: number;
    cokerUnheadHr: number;
    cokerCuttingHr: number;
    cokerSetupHr: number;
    cokerNumDrums: number;
    // Visbreaker
    vbFeedViscosityCst: number;
    vbCoilTempF: number;
    vbResidenceTimeSec: number;
    vbType: VisbreakerType;
    // SDA
    sdaFeedCCRWtPct: number;
    sdaSolvent: SolventType;
    // Catalyst economics
    freshCatCostPerTon: number;
    eCatValuePerTon: number;
    preciousMetalCostPerLb: number;
}

const defaultState: ConversionState = {
    fccFeedRateBpd: 55000,
    fccFeedApi: 22,
    fccFeedSulfurWtPct: 1.8,
    fccFeedCCRWtPct: 0.8,
    fccRiserOutletF: 990,
    fccCatToOil: 7,
    fccZsm5WtPct: 2,
    fccFeedMetalsNiVppm: 25,
    fccMode: 'max-gasoline',
    hcFeedRateBpd: 35000,
    hcFeedApi: 18,
    hcFeedSulfurWtPct: 2.2,
    hcFeedNitrogenPpm: 1200,
    hcReactorTempF: 740,
    hcPressurePsig: 2200,
    hcLhsv: 1.0,
    hcMode: 'recycle',
    hcOperatingDays: 730,
    hcStartOfRunTempF: 690,
    hcEndOfRunTempF: 790,
    hcTempRampRateFPMonth: 4.5,
    cokerFeedRateBpd: 30000,
    cokerFeedApi: 8,
    cokerFeedCCRWtPct: 22,
    cokerFeedSulfurWtPct: 4.5,
    cokerDrumTempF: 855,
    cokerDrumPressurePsig: 25,
    cokerRecycleRatio: 0.12,
    cokerCokeType: 'fuel',
    cokerFillHr: 16,
    cokerSteamHr: 3,
    cokerQuenchHr: 8,
    cokerDrainHr: 2,
    cokerUnheadHr: 2,
    cokerCuttingHr: 4,
    cokerSetupHr: 2,
    cokerNumDrums: 4,
    vbFeedViscosityCst: 8000,
    vbCoilTempF: 905,
    vbResidenceTimeSec: 90,
    vbType: 'coil',
    sdaFeedCCRWtPct: 20,
    sdaSolvent: 'butane',
    freshCatCostPerTon: 3500,
    eCatValuePerTon: 500,
    preciousMetalCostPerLb: 1800,
};

// ────────────────────────────────────────
// Main Component
// ────────────────────────────────────────
const ConversionComplexModule: React.FC = () => {
    const [state, setState] = useState<ConversionState>(defaultState);
    const [showFCC, setShowFCC] = useState(true);
    const [showHC, setShowHC] = useState(true);
    const [showCoker, setShowCoker] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [activeTab, setActiveTab] = useState<'fcc' | 'hydrocracker' | 'coker' | 'visbreaker' | 'sda'>('fcc');

    const update = useCallback(<K extends keyof ConversionState>(k: K, v: ConversionState[K]) => {
        setState(prev => ({ ...prev, [k]: v }));
    }, []);

    // ── FCC Computations ──
    const fccResult = useMemo(() => {
        const s = state;
        const base = fccYields(s.fccFeedRateBpd, s.fccFeedApi, s.fccFeedSulfurWtPct, s.fccFeedCCRWtPct, s.fccRiserOutletF, s.fccCatToOil, s.fccZsm5WtPct);
        const heat = fccRegeneratorHeatBalance(base.cokeWtPct, s.fccFeedRateBpd, s.fccFeedApi, s.fccCatToOil * s.fccFeedRateBpd * sgFromAPI(s.fccFeedApi) * 42 * 8.33 / 24 / 2000 / 60, 1320, 120000);
        const ecat = fccCatalystDeactivation(15, 450, s.fccFeedMetalsNiVppm * 0.4, s.fccFeedMetalsNiVppm * 0.6, s.fccFeedRateBpd);
        const kin = fccFourLumpKinetics(s.fccFeedRateBpd, s.fccFeedApi, s.fccCatToOil, s.fccRiserOutletF, 3.5, ecat.matActivity);
        const totalLiquidBpd = base.gasolineBpd + base.lcoBpd + base.slurryBpd;
        const totalGasBpd = s.fccFeedRateBpd - totalLiquidBpd;
        return { ...base, ...heat, ...ecat, ...kin, totalGasBpd };
    }, [state]);

    // ── Hydrocracker Computations ──
    const hcResult = useMemo(() => {
        const s = state;
        const base = hydrocrackerYields(s.hcFeedRateBpd, s.hcFeedApi, s.hcFeedSulfurWtPct, s.hcFeedNitrogenPpm, s.hcReactorTempF, s.hcPressurePsig, s.hcLhsv, s.hcMode);
        const cat = hydrocrackerCatalystLife(s.hcStartOfRunTempF, s.hcEndOfRunTempF, s.hcTempRampRateFPMonth, s.hcFeedNitrogenPpm * 0.001, s.hcFeedSulfurWtPct);
        const h2TotalMMscfd = base.h2ConsumptionScfBbl * s.hcFeedRateBpd / 1_000_000;
        return { ...base, ...cat, h2TotalMMscfd };
    }, [state]);

    // ── Coker Computations ──
    const cokerResult = useMemo(() => {
        const s = state;
        const base = cokerYields(s.cokerFeedRateBpd, s.cokerFeedApi, s.cokerFeedCCRWtPct, s.cokerFeedSulfurWtPct, s.cokerDrumTempF, s.cokerDrumPressurePsig, s.cokerRecycleRatio);
        const cycle = cokerCycleAnalysis(s.cokerFillHr, s.cokerSteamHr, s.cokerQuenchHr, s.cokerDrainHr, s.cokerUnheadHr, s.cokerCuttingHr, s.cokerSetupHr, s.cokerNumDrums, s.cokerFeedRateBpd);
        const cokeTonsPerDay = s.cokerFeedRateBpd * sgFromAPI(s.cokerFeedApi) * 42 * 8.33 / 2000 * base.cokeWtPct / 100;
        const cokeValuePerDay = s.cokerCokeType === 'needle' ? cokeTonsPerDay * 600 : s.cokerCokeType === 'anode' ? cokeTonsPerDay * 350 : cokeTonsPerDay * 65;
        return { ...base, ...cycle, cokeTonsPerDay, cokeValuePerDay };
    }, [state]);

    // ── Visbreaker Computations ──
    const vbResult = useMemo(() => {
        const s = state;
        const effResidenceTime = s.vbType === 'soaker' ? s.vbResidenceTimeSec * 2.5 : s.vbResidenceTimeSec;
        const effCoilTemp = s.vbType === 'soaker' ? s.vbCoilTempF - 20 : s.vbCoilTempF;
        return visbreakerConversion(s.vbFeedViscosityCst, effCoilTemp, effResidenceTime);
    }, [state]);

    // ── SDA Computations ──
    const sdaResult = useMemo(() => sdaDAOYield(state.sdaFeedCCRWtPct, state.sdaSolvent), [state]);

    // ── Conversion Economics Summary ──
    const econSummary = useMemo(() => {
        const fccTotalProductBpd = fccResult.gasolineBpd + fccResult.lcoBpd + fccResult.propyleneBpd + fccResult.butyleneBpd;
        const hcTotalProductBpd = hcResult.naphthaBpd + hcResult.keroseneBpd + hcResult.dieselBpd + hcResult.lpgBpd;
        const ckrTotalProductBpd = cokerResult.naphthaBpd + cokerResult.lcgoBpd + cokerResult.hcgoBpd;
        const totalFeedBpd = state.fccFeedRateBpd + state.hcFeedRateBpd + state.cokerFeedRateBpd;
        const totalProductBpd = fccTotalProductBpd + hcTotalProductBpd + ckrTotalProductBpd;
        const avgConversion = totalFeedBpd > 0 ? (totalProductBpd / totalFeedBpd * 100) : 0;
        const totalH2MMscfd = hcResult.h2TotalMMscfd;
        const totalCokeTpd = cokerResult.cokeTonsPerDay;
        return { totalFeedBpd, totalProductBpd, avgConversion, totalH2MMscfd, totalCokeTpd };
    }, [fccResult, hcResult, cokerResult, state]);

    // ── Chart Data ──
    const fccProductData = useMemo(() => [
        { name: 'Gasoline', bpd: fccResult.gasolineBpd, fill: '#f59e0b' },
        { name: 'LCO', bpd: fccResult.lcoBpd, fill: '#3b82f6' },
        { name: 'Slurry', bpd: fccResult.slurryBpd, fill: '#ef4444' },
        { name: 'Propylene', bpd: fccResult.propyleneBpd, fill: '#10b981' },
        { name: 'Butylene', bpd: fccResult.butyleneBpd, fill: '#8b5cf6' },
        { name: 'Dry Gas+', bpd: fccResult.totalGasBpd, fill: '#64748b' },
    ], [fccResult]);

    const hcProductData = useMemo(() => [
        { name: 'Diesel', bpd: hcResult.dieselBpd, fill: '#3b82f6' },
        { name: 'Kerosene', bpd: hcResult.keroseneBpd, fill: '#f59e0b' },
        { name: 'Naphtha', bpd: hcResult.naphthaBpd, fill: '#10b981' },
        { name: 'LPG', bpd: hcResult.lpgBpd, fill: '#8b5cf6' },
        { name: 'UCO', bpd: hcResult.ucoBpd, fill: '#ef4444' },
    ], [hcResult]);

    const cokerProductData = useMemo(() => [
        { name: 'LCGO', bpd: cokerResult.lcgoBpd, fill: '#3b82f6' },
        { name: 'HCGO', bpd: cokerResult.hcgoBpd, fill: '#f59e0b' },
        { name: 'Naphtha', bpd: cokerResult.naphthaBpd, fill: '#10b981' },
        { name: 'Coke*', bpd: 0, tonsPerDay: cokerResult.cokeTonsPerDay, fill: '#ef4444' },
        { name: 'Gas+LPG', bpd: 0, fill: '#64748b' },
    ], [cokerResult]);

    const sdaData = useMemo(() => [
        { name: 'DAO Yield', value: sdaResult.daoYieldPct, fill: '#10b981' },
        { name: 'Pitch', value: sdaResult.pitchYieldPct, fill: '#ef4444' },
    ], [sdaResult]);

    const conversionComparison = useMemo(() => [
        { name: 'FCC', conversion: fccResult.conversion, feed: state.fccFeedRateBpd },
        { name: 'Hydrocracker', conversion: hcResult.conversion, feed: state.hcFeedRateBpd },
        { name: 'Coker', conversion: 100 - cokerResult.cokeWtPct, feed: state.cokerFeedRateBpd },
        { name: 'Visbreaker', conversion: vbResult.conversion, feed: 0 },
        { name: 'SDA', conversion: sdaResult.daoYieldPct, feed: 0 },
    ], [fccResult, hcResult, cokerResult, vbResult, sdaResult, state]);

    const catLifeData = useMemo(() => {
        const pts: { month: number; tempF: number }[] = [];
        for (let m = 0; m <= hcResult.cycleLengthMonths; m += Math.max(1, Math.floor(hcResult.cycleLengthMonths / 12))) {
            pts.push({ month: m, tempF: state.hcStartOfRunTempF + (m / hcResult.cycleLengthMonths) * (state.hcEndOfRunTempF - state.hcStartOfRunTempF) });
        }
        return pts;
    }, [hcResult, state]);

    // ── Input Components ──
    const Slider = ({ label, value, min, max, step, onChange, unit = '', colorClass = 'text-slate-300' }: {
        label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string; colorClass?: string
    }) => (
        <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">{label}</span>
                <span className={`font-mono ${colorClass}`}>{fmt(value, step < 1 ? 2 : 0)} {unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500" />
        </div>
    );

    const Selector = ({ label, value, options, onChange }: {
        label: string; value: string; options: string[]; onChange: (v: any) => void
    }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-[10px] bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 font-mono">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    // ── Render ──
    return (
        <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-lg font-bold text-white">6.6 Conversion Complex — Cracking & Upgrading</h2>
                    <p className="text-[11px] text-slate-400">FCC · Hydrocracker · Delayed Coker · Visbreaker · SDA — Full Kinetic & Economic Models</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                    {(['fcc', 'hydrocracker', 'coker', 'visbreaker', 'sda'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${activeTab === tab
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}>
                            {tab === 'fcc' ? 'FCC' : tab === 'hydrocracker' ? 'Hydrocracker' : tab === 'coker' ? 'Coker' : tab === 'visbreaker' ? 'Visbreaker' : 'SDA'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Conversion Overview Bar ── */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                    <div className="text-center"><div className="text-slate-500">Total Feed</div><div className="text-cyan-400 font-bold font-mono">{fmtInt(econSummary.totalFeedBpd)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-500">Total Products</div><div className="text-emerald-400 font-bold font-mono">{fmtInt(econSummary.totalProductBpd)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-500">Avg Conversion</div><div className="text-amber-400 font-bold font-mono">{pct(econSummary.avgConversion)}</div></div>
                    <div className="text-center"><div className="text-slate-500">Total H₂</div><div className="text-indigo-400 font-bold font-mono">{fmt(econSummary.totalH2MMscfd, 1)} MMscfd</div></div>
                    <div className="text-center"><div className="text-slate-500">Coke Production</div><div className="text-red-400 font-bold font-mono">{fmtInt(cokerResult.cokeTonsPerDay)} TPD</div></div>
                </div>
            </div>

            {/* ── FCC Tab ── */}
            {activeTab === 'fcc' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="text-sm font-bold text-white">Fluid Catalytic Cracking (FCC)</span>
                        <span className="text-[10px] text-slate-500">— Riser-Reactor-Regenerator</span>
                    </div>

                    {/* FCC Controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-700/50 rounded p-3">
                        <Slider label="Feed Rate" value={state.fccFeedRateBpd} min={5000} max={200000} step={500}
                            onChange={v => update('fccFeedRateBpd', v)} unit="BPD" colorClass="text-cyan-400" />
                        <Slider label="Feed API Gravity" value={state.fccFeedApi} min={10} max={35} step={0.5}
                            onChange={v => update('fccFeedApi', v)} unit="°API" colorClass="text-cyan-400" />
                        <Slider label="Feed Sulfur" value={state.fccFeedSulfurWtPct} min={0.1} max={5} step={0.1}
                            onChange={v => update('fccFeedSulfurWtPct', v)} unit="wt%" colorClass="text-yellow-400" />
                        <Slider label="Feed CCR" value={state.fccFeedCCRWtPct} min={0} max={5} step={0.1}
                            onChange={v => update('fccFeedCCRWtPct', v)} unit="wt%" colorClass="text-red-400" />
                        <Slider label="Riser Outlet Temp" value={state.fccRiserOutletF} min={900} max={1050} step={5}
                            onChange={v => update('fccRiserOutletF', v)} unit="°F" colorClass="text-amber-400" />
                        <Slider label="Cat-to-Oil Ratio" value={state.fccCatToOil} min={4} max={12} step={0.2}
                            onChange={v => update('fccCatToOil', v)} unit="lb/lb" colorClass="text-indigo-400" />
                        <Slider label="ZSM-5 Additive" value={state.fccZsm5WtPct} min={0} max={10} step={0.5}
                            onChange={v => update('fccZsm5WtPct', v)} unit="wt%" colorClass="text-purple-400" />
                        <Slider label="Feed Metals (Ni+V)" value={state.fccFeedMetalsNiVppm} min={0} max={100} step={1}
                            onChange={v => update('fccFeedMetalsNiVppm', v)} unit="ppm" colorClass="text-red-400" />
                        <Selector label="FCC Mode" value={state.fccMode} options={['max-gasoline', 'max-olefins', 'max-diesel', 'custom']}
                            onChange={v => update('fccMode', v)} />
                    </div>

                    {/* FCC Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* FCC Yields Card */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-cyan-400 mb-2">FCC Product Yields</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Conversion</span><span className="text-cyan-400 font-bold">{pct(fccResult.conversion)}</span></div>
                                <div className="flex justify-between"><span className="text-amber-400">Gasoline</span><span>{fmtInt(fccResult.gasolineBpd)} BPD (RON {fmt(fccResult.gasolineRON, 1)})</span></div>
                                <div className="flex justify-between"><span className="text-blue-400">LCO</span><span>{fmtInt(fccResult.lcoBpd)} BPD (Cetane {fmt(fccResult.lcoCetane, 1)})</span></div>
                                <div className="flex justify-between"><span className="text-red-400">Slurry Oil</span><span>{fmtInt(fccResult.slurryBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-emerald-400">Propylene</span><span>{fmtInt(fccResult.propyleneBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-purple-400">Butylene</span><span>{fmtInt(fccResult.butyleneBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Coke (wt%)</span><span>{fmt(fccResult.cokeWtPct, 2)}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Dry Gas (wt%)</span><span>{fmt(fccResult.dryGasWtPct, 2)}%</span></div>
                            </div>
                        </div>

                        {/* FCC Products Bar Chart */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Product Distribution</h4>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={fccProductData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={fmtInt} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={60} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                                        formatter={(val: number) => [fmtInt(val) + ' BPD']} />
                                    <Bar dataKey="bpd" fill="#06b6d4" radius={[0, 3, 3, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* FCC Catalyst + Regenerator */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 mb-1">Catalyst & Regenerator</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">E-cat Activity (MAT)</span><span className="text-cyan-400">{fmt(fccResult.matActivity, 1)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Ni on E-cat</span><span className="text-yellow-400">{fmt(fccResult.niOnEcatPpm, 0)} ppm</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">V on E-cat</span><span className="text-red-400">{fmt(fccResult.vOnEcatPpm, 0)} ppm</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Cat Replacement</span><span>{fmt(fccResult.catReplacementDays, 0)} days</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Monthly Cat Cost</span><span className="text-indigo-400">${fmt(fccResult.monthlyCatCost / 1000, 0)}K</span></div>
                                <hr className="border-slate-700" />
                                <div className="flex justify-between"><span className="text-slate-400">Regen Heat Balance</span><span className={fccResult.heatBalanced ? 'text-emerald-400' : 'text-red-400'}>{fccResult.heatBalanced ? '✓ Balanced' : '✗ Imbalanced'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Excess O₂ in Flue Gas</span><span>{fmt(fccResult.excessO2Pct, 1)}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">4-Lump Conversion</span><span className="text-cyan-400">{pct(fccResult.conversionVolPct)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Kinetic Gasoline</span><span>{pct(fccResult.gasolineYieldVolPct)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Hydrocracker Tab ── */}
            {activeTab === 'hydrocracker' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span className="text-sm font-bold text-white">Hydrocracker</span>
                        <span className="text-[10px] text-slate-500">— High-Pressure Diesel/Jet Maximization</span>
                    </div>

                    {/* HC Controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-700/50 rounded p-3">
                        <Slider label="Feed Rate" value={state.hcFeedRateBpd} min={5000} max={150000} step={500}
                            onChange={v => update('hcFeedRateBpd', v)} unit="BPD" colorClass="text-indigo-400" />
                        <Slider label="Feed API" value={state.hcFeedApi} min={10} max={30} step={0.5}
                            onChange={v => update('hcFeedApi', v)} unit="°API" colorClass="text-indigo-400" />
                        <Slider label="Feed Sulfur" value={state.hcFeedSulfurWtPct} min={0.1} max={5} step={0.1}
                            onChange={v => update('hcFeedSulfurWtPct', v)} unit="wt%" colorClass="text-yellow-400" />
                        <Slider label="Feed Nitrogen" value={state.hcFeedNitrogenPpm} min={100} max={4000} step={100}
                            onChange={v => update('hcFeedNitrogenPpm', v)} unit="ppm" colorClass="text-red-400" />
                        <Slider label="Reactor Temp" value={state.hcReactorTempF} min={600} max={850} step={5}
                            onChange={v => update('hcReactorTempF', v)} unit="°F" colorClass="text-amber-400" />
                        <Slider label="Pressure" value={state.hcPressurePsig} min={800} max={3500} step={50}
                            onChange={v => update('hcPressurePsig', v)} unit="psig" colorClass="text-cyan-400" />
                        <Slider label="LHSV" value={state.hcLhsv} min={0.3} max={3} step={0.1}
                            onChange={v => update('hcLhsv', v)} unit="hr⁻¹" colorClass="text-emerald-400" />
                        <Selector label="Mode" value={state.hcMode} options={['once-through', 'recycle']}
                            onChange={v => update('hcMode', v)} />
                        <Slider label="Start-of-Run Temp" value={state.hcStartOfRunTempF} min={600} max={780} step={5}
                            onChange={v => update('hcStartOfRunTempF', v)} unit="°F" colorClass="text-slate-300" />
                        <Slider label="End-of-Run Temp" value={state.hcEndOfRunTempF} min={720} max={850} step={5}
                            onChange={v => update('hcEndOfRunTempF', v)} unit="°F" colorClass="text-slate-300" />
                        <Slider label="Deactivation Rate" value={state.hcTempRampRateFPMonth} min={1} max={12} step={0.5}
                            onChange={v => update('hcTempRampRateFPMonth', v)} unit="°F/mo" colorClass="text-red-400" />
                    </div>

                    {/* HC Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-indigo-400 mb-2">Hydrocracker Yields</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Conversion</span><span className="text-indigo-400 font-bold">{pct(hcResult.conversion)}</span></div>
                                <div className="flex justify-between"><span className="text-blue-400">Diesel</span><span>{fmtInt(hcResult.dieselBpd)} BPD (Cetane {fmt(hcResult.dieselCetane, 1)})</span></div>
                                <div className="flex justify-between"><span className="text-amber-400">Kerosene</span><span>{fmtInt(hcResult.keroseneBpd)} BPD (SP {fmt(hcResult.keroseneSmokePoint, 1)} mm)</span></div>
                                <div className="flex justify-between"><span className="text-emerald-400">Naphtha</span><span>{fmtInt(hcResult.naphthaBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-purple-400">LPG</span><span>{fmtInt(hcResult.lpgBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-red-400">UCO</span><span>{fmtInt(hcResult.ucoBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-cyan-400">H₂ Consumption</span><span>{fmt(hcResult.h2ConsumptionScfBbl, 0)} scf/bbl</span></div>
                                <div className="flex justify-between"><span className="text-indigo-400">Total H₂</span><span className="font-bold">{fmt(hcResult.h2TotalMMscfd, 1)} MMscfd</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Product Distribution</h4>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={hcProductData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={fmtInt} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={60} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                                        formatter={(val: number) => [fmtInt(val) + ' BPD']} />
                                    <Bar dataKey="bpd" fill="#6366f1" radius={[0, 3, 3, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Catalyst Life & Cycle</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Cycle Length</span><span className="text-cyan-400">{fmt(hcResult.cycleLengthMonths, 1)} mo ({fmt(hcResult.cycleLengthYears, 2)} yr)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">End-of-Cycle Date</span><span className="text-indigo-400">{hcResult.endOfCycleDate}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Deactivation Rate</span><span className="text-red-400">{fmt(hcResult.deactivationRatePctMonth, 2)}%/mo</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Metals Accumulation</span><span className="text-yellow-400">{fmt(hcResult.metalsAccumulationWtPct, 3)} wt%</span></div>
                            </div>
                            <div className="mt-2">
                                <ResponsiveContainer width="100%" height={140}>
                                    <LineChart data={catLifeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={9} label={{ value: 'Month', position: 'insideBottom', fontSize: 9, fill: '#64748b' }} />
                                        <YAxis domain={[state.hcStartOfRunTempF - 10, state.hcEndOfRunTempF + 10]} stroke="#64748b" fontSize={9} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                        <Line type="monotone" dataKey="tempF" stroke="#f59e0b" strokeWidth={2} dot={false} name="SOR→EOR Temp" />
                                        <ReferenceLine y={state.hcStartOfRunTempF} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'SOR', fontSize: 8, fill: '#10b981' }} />
                                        <ReferenceLine y={state.hcEndOfRunTempF} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'EOR', fontSize: 8, fill: '#ef4444' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Coker Tab ── */}
            {activeTab === 'coker' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm font-bold text-white">Delayed Coker</span>
                        <span className="text-[10px] text-slate-500">— Bottom-of-the-Barrel Conversion</span>
                    </div>

                    {/* Coker Controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-700/50 rounded p-3">
                        <Slider label="Feed Rate" value={state.cokerFeedRateBpd} min={5000} max={100000} step={500}
                            onChange={v => update('cokerFeedRateBpd', v)} unit="BPD" colorClass="text-red-400" />
                        <Slider label="Feed API" value={state.cokerFeedApi} min={2} max={20} step={0.5}
                            onChange={v => update('cokerFeedApi', v)} unit="°API" colorClass="text-red-400" />
                        <Slider label="Feed CCR" value={state.cokerFeedCCRWtPct} min={5} max={40} step={0.5}
                            onChange={v => update('cokerFeedCCRWtPct', v)} unit="wt%" colorClass="text-red-400" />
                        <Slider label="Feed Sulfur" value={state.cokerFeedSulfurWtPct} min={0.5} max={8} step={0.1}
                            onChange={v => update('cokerFeedSulfurWtPct', v)} unit="wt%" colorClass="text-yellow-400" />
                        <Slider label="Drum Temperature" value={state.cokerDrumTempF} min={800} max={900} step={5}
                            onChange={v => update('cokerDrumTempF', v)} unit="°F" colorClass="text-amber-400" />
                        <Slider label="Drum Pressure" value={state.cokerDrumPressurePsig} min={10} max={90} step={1}
                            onChange={v => update('cokerDrumPressurePsig', v)} unit="psig" colorClass="text-cyan-400" />
                        <Slider label="Recycle Ratio" value={state.cokerRecycleRatio} min={0} max={0.3} step={0.01}
                            onChange={v => update('cokerRecycleRatio', v)} unit="vol/vol" colorClass="text-purple-400" />
                        <Selector label="Coke Type" value={state.cokerCokeType} options={['fuel', 'anode', 'needle']}
                            onChange={v => update('cokerCokeType', v)} />
                    </div>

                    {/* Coker Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-red-400 mb-2">Coker Yields</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Coke Yield</span><span className="text-red-400 font-bold">{pct(cokerResult.cokeWtPct)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Liquid Yield</span><span className="text-emerald-400">{pct(cokerResult.liquidYieldPct)}</span></div>
                                <div className="flex justify-between"><span className="text-blue-400">LCGO</span><span>{fmtInt(cokerResult.lcgoBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-amber-400">HCGO</span><span>{fmtInt(cokerResult.hcgoBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-emerald-400">Naphtha</span><span>{fmtInt(cokerResult.naphthaBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Gas (wt%)</span><span>{fmt(cokerResult.gasWtPct, 1)}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">LPG (wt%)</span><span>{fmt(cokerResult.lpgWtPct, 1)}%</span></div>
                                <div className="flex justify-between"><span className="text-red-400">Coke</span><span className="font-bold">{fmtInt(cokerResult.cokeTonsPerDay)} TPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Coke Value</span><span className="text-emerald-400">${fmt(cokerResult.cokeValuePerDay / 1000, 0)}K/day</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Product Distribution</h4>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={cokerProductData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={fmtInt} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={65} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                    <Bar dataKey="bpd" fill="#ef4444" radius={[0, 3, 3, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 mb-1">Drum Cycle Analysis</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Total Cycle</span><span>{fmt(cokerResult.totalCycleHours, 1)} hr</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Fill Time</span><span>{state.cokerFillHr} hr</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Steam + Quench</span><span>{state.cokerSteamHr + state.cokerQuenchHr} hr</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Decoking</span><span>{state.cokerDrainHr + state.cokerUnheadHr + state.cokerCuttingHr} hr</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Drums per Day</span><span className="text-cyan-400">{fmt(cokerResult.drumsPerDay, 2)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Throughput/Drum</span><span>{fmtInt(cokerResult.throughputPerDrumBbl)} bbl</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Utilization</span><span className="text-emerald-400">{pct(cokerResult.utilizationPct)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Vapor Recovery</span><span>{pct(cokerResult.vaporRecoveryPct)}</span></div>
                            </div>
                            {/* Drum Cycle Gantt-style bar */}
                            <div className="mt-2">
                                <div className="text-[11px] text-slate-500 mb-1">Drum Cycle Visualization</div>
                                <div className="w-full h-5 bg-slate-800 rounded overflow-hidden flex">
                                    {[
                                        { w: state.cokerFillHr / cokerResult.totalCycleHours * 100, color: 'bg-red-500', label: 'Fill' },
                                        { w: state.cokerSteamHr / cokerResult.totalCycleHours * 100, color: 'bg-orange-500', label: 'Steam' },
                                        { w: state.cokerQuenchHr / cokerResult.totalCycleHours * 100, color: 'bg-cyan-500', label: 'Quench' },
                                        { w: (state.cokerDrainHr + state.cokerUnheadHr + state.cokerCuttingHr + state.cokerSetupHr) / cokerResult.totalCycleHours * 100, color: 'bg-slate-500', label: 'Decoke' },
                                    ].map((seg, i) => (
                                        <div key={i} className={`${seg.color} h-full flex items-center justify-center text-[10px] text-white font-bold`}
                                            style={{ width: `${seg.w}%` }}>{seg.w > 8 ? seg.label : ''}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Visbreaker Tab ── */}
            {activeTab === 'visbreaker' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm font-bold text-white">Visbreaker</span>
                        <span className="text-[10px] text-slate-500">— Mild Thermal Cracking for Viscosity Reduction</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded p-3 space-y-2">
                            <h4 className="text-xs font-bold text-amber-400 mb-1">Visbreaker Operating Parameters</h4>
                            <Slider label="Feed Viscosity" value={state.vbFeedViscosityCst} min={500} max={50000} step={100}
                                onChange={v => update('vbFeedViscosityCst', v)} unit="cSt" colorClass="text-amber-400" />
                            <Slider label="Coil Temperature" value={state.vbCoilTempF} min={850} max={950} step={5}
                                onChange={v => update('vbCoilTempF', v)} unit="°F" colorClass="text-red-400" />
                            <Slider label="Residence Time" value={state.vbResidenceTimeSec} min={30} max={300} step={5}
                                onChange={v => update('vbResidenceTimeSec', v)} unit="sec" colorClass="text-cyan-400" />
                            <Selector label="Visbreaker Type" value={state.vbType} options={['coil', 'soaker']}
                                onChange={v => update('vbType', v)} />
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-orange-400 mb-2">Visbreaker Performance</h4>
                            <div className="space-y-3 text-[11px] font-mono">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Conversion</span>
                                    <span className="text-cyan-400 text-lg font-bold">{pct(vbResult.conversion)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Feed Viscosity</span>
                                    <span>{fmtInt(state.vbFeedViscosityCst)} cSt</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Product Viscosity</span>
                                    <span className="text-emerald-400 font-bold">{fmtInt(vbResult.productViscosityCst)} cSt</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Viscosity Reduction</span>
                                    <span className="text-emerald-400">{pct((1 - vbResult.productViscosityCst / state.vbFeedViscosityCst) * 100)}</span>
                                </div>
                                <hr className="border-slate-700" />
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Effective Coil Temp</span>
                                    <span>{state.vbType === 'soaker' ? state.vbCoilTempF - 20 : state.vbCoilTempF}°F</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Effective Residence</span>
                                    <span>{state.vbType === 'soaker' ? state.vbResidenceTimeSec * 2.5 : state.vbResidenceTimeSec} sec</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-2">
                                    Soaker drum: lower furnace temp, longer residence — reduces tube coking risk
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Viscosity Comparison Bar */}
                    <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                        <h4 className="text-xs font-bold text-slate-400 mb-2">Viscosity Before → After</h4>
                        <div className="flex items-end gap-4">
                            <div className="text-center">
                                <div className="text-[11px] text-slate-500">Feed</div>
                                <div className="bg-red-500/30 w-16 rounded-t"
                                    style={{ height: Math.min(120, Math.log10(state.vbFeedViscosityCst / 10) * 40) }}>
                                    <div className="text-[11px] text-red-400 mt-1">{fmtInt(state.vbFeedViscosityCst)} cSt</div>
                                </div>
                            </div>
                            <div className="text-[24px] text-slate-600">→</div>
                            <div className="text-center">
                                <div className="text-[11px] text-slate-500">Product</div>
                                <div className="bg-emerald-500/30 w-16 rounded-t"
                                    style={{ height: Math.min(120, Math.log10(vbResult.productViscosityCst / 10) * 40) }}>
                                    <div className="text-[11px] text-emerald-400 mt-1">{fmtInt(vbResult.productViscosityCst)} cSt</div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[11px] text-slate-500">Reduction</div>
                                <div className="text-cyan-400 text-sm font-bold">{pct((1 - vbResult.productViscosityCst / state.vbFeedViscosityCst) * 100)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SDA Tab ── */}
            {activeTab === 'sda' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold text-white">Solvent Deasphalting (SDA)</span>
                        <span className="text-[10px] text-slate-500">— ROSE Process / Supercritical</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded p-3 space-y-2">
                            <h4 className="text-xs font-bold text-emerald-400 mb-1">SDA Parameters</h4>
                            <Slider label="Feed CCR" value={state.sdaFeedCCRWtPct} min={5} max={35} step={0.5}
                                onChange={v => update('sdaFeedCCRWtPct', v)} unit="wt%" colorClass="text-red-400" />
                            <Selector label="Solvent Type" value={state.sdaSolvent} options={['propane', 'butane', 'pentane']}
                                onChange={v => update('sdaSolvent', v)} />
                            <div className="text-[10px] text-slate-500 mt-1">
                                Solvent power: Propane (most selective, lowest yield) → Pentane (highest yield, less selective)
                            </div>
                        </div>

                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-emerald-400 mb-2">SDA Results — ROSE Process</h4>
                            <div className="space-y-1 text-[11px] font-mono mb-2">
                                <div className="flex justify-between"><span className="text-slate-400">DAO Yield</span><span className="text-emerald-400 font-bold">{pct(sdaResult.daoYieldPct)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">DAO CCR</span><span className="text-cyan-400">{fmt(sdaResult.daoCCRWtPct, 2)} wt%</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Pitch Yield</span><span className="text-red-400">{pct(sdaResult.pitchYieldPct)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">CCR Reduction</span><span className="text-emerald-400">{pct((1 - sdaResult.daoCCRWtPct / state.sdaFeedCCRWtPct) * 100)}</span></div>
                            </div>
                            {/* Radial bar for SDA */}
                            <ResponsiveContainer width="100%" height={180}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="85%" data={sdaData} startAngle={180} endAngle={-180}>
                                    <RadialBar dataKey="value" cornerRadius={6} />
                                    <Legend iconSize={8} fontSize={9} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Conversion Comparison Chart ── */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <h4 className="text-xs font-bold text-slate-400 mb-2">Conversion Comparison Across Units</h4>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={conversionComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} unit="%" domain={[0, 105]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                        <Bar dataKey="conversion" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Conversion %">
                            {conversionComparison.map((_, i) => (
                                <rect key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Economic Toggle ── */}
            <div>
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    {showAdvanced ? '\u25BC' : '\u25B6'} Advanced: Catalyst Economics & Flexicoking
                </button>
                {showAdvanced && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Catalyst Economics</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Fresh Cat Cost</span><span>${fmtInt(state.freshCatCostPerTon)}/ton</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">E-cat Credit</span><span>${fmtInt(state.eCatValuePerTon)}/ton</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Net Cat Cost/Day</span><span className="text-red-400">${fmt(fccResult.monthlyCatCost / 30, 0)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Precious Metal Cost</span><span>${fmtInt(state.preciousMetalCostPerLb)}/lb</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">HC Cycle Margin</span><span className="text-emerald-400">{fmt(hcResult.cycleLengthMonths, 1)} months → revenue opportunity</span></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Conversion Unit Economics</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">FCC Feed Rate</span><span className="text-cyan-400">{fmtInt(state.fccFeedRateBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">HC Feed Rate</span><span className="text-indigo-400">{fmtInt(state.hcFeedRateBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Coker Feed Rate</span><span className="text-red-400">{fmtInt(state.cokerFeedRateBpd)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Total Conversion Feed</span><span className="font-bold">{fmtInt(econSummary.totalFeedBpd)} BPD</span></div>
                                <hr className="border-slate-700" />
                                <div className="flex justify-between"><span className="text-slate-400">Coke Revenue</span><span>${fmt(cokerResult.cokeValuePerDay / 1000, 0)}K/day</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">H₂ Cost (@$3/Mscf)</span><span>${fmt(econSummary.totalH2MMscfd * 3000, 0)}K/day</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">FCC Catalyst</span><span>${fmt(fccResult.monthlyCatCost / 30, 0)}/day</span></div>
                                <div className="text-[10px] text-slate-500 mt-2">
                                    Flexicoking: ExxonMobil tech — integrates gasification with coking, eliminates solid coke
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Key Equations Reference ── */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                FCC Conversion = f(UOP K, riser T, Cat/Oil, CCR){' '}
                | HC Severity = f(T, P, LHSV, N penalty){' '}
                | Coke yield = 1.6×CCR + ΔP effect + ΔT effect{' '}
                | ROSE DAO = f(solvent power, CCR){' '}
                | 4-Lump Kinetics: dC/dτ = K·C (VGO→Gasoline→LPG→Gas + VGO→Coke){' '}
                | E-cat Activity = f(fresh add rate, metals poisoning, hydrothermal deactivation){' '}
                | HC Cycle Life = (EOR−SOR) / deactivation rate{' '}
                | Coker Drum Cycle = Fill + Steam + Quench + Drain + Unhead + Cut + Setup{' '}
                | SDA Solvent Power: Propane (0.6) {'<'} Butane (0.75) {'<'} Pentane (0.85)
            </div>
        </div>
    );
};

export default ConversionComplexModule;