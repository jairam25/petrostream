import React, { useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
    smrHydrogenProduction, hydrogenBalance, amineCirculationRate,
    sourWaterStripper, clausEfficiency,
    refineryEmissionsInventory, wastewaterTreatmentMassBalance,
    gasTurbineCHP
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
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899'];

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────
interface EnvState {
    // SMR
    smrFeedMMscfd: number;
    smrSteamToCarbon: number;
    smrReformerTempF: number;
    smrShiftTempF: number;
    psaRecoveryPct: number;
    // Amine
    acidGasRateMMscfd: number;
    acidGasH2sConcPct: number;
    amineCirculationGpm: number;
    amineType: 'MDEA' | 'DEA' | 'MEA';
    // SWS
    swsFeedGpm: number;
    swsH2sPpm: number;
    swsNh3Ppm: number;
    swsSteamRateLbHr: number;
    // SRU
    sruAcidGasMMscfd: number;
    sruH2sConcPct: number;
    sruRecoveryStage: '2-stage' | '3-stage' | '3-stage+TGTU';
    // Emissions
    fccRegenGasMMscfd: number;
    fccSOxPpm: number;
    fccNOxPpm: number;
    heaterFuelGasMMscfd: number;
    heaterNOxPpm: number;
    fugitiveVOCLbHr: number;
    cemsSO2LbHr: number;
    cemsNOxLbHr: number;
    cemsCO2TonHr: number;
    // Wastewater
    wwFlowGpm: number;
    wwOilPpm: number;
    wwBODPpm: number;
    wwPhenolPpm: number;
    wwSulfidePpm: number;
    // Flare
    flareGasMMscfd: number;
    flareRecoveryPct: number;
    // Cogen
    cogenGasTurbineMw: number;
    cogenHeatRateBtuKwh: number;
    hrsgSteamLbHr: number;
}

const defaultEnv: EnvState = {
    smrFeedMMscfd: 45,
    smrSteamToCarbon: 3.0,
    smrReformerTempF: 1550,
    smrShiftTempF: 680,
    psaRecoveryPct: 88,
    acidGasRateMMscfd: 12,
    acidGasH2sConcPct: 65,
    amineCirculationGpm: 1200,
    amineType: 'MDEA',
    swsFeedGpm: 400,
    swsH2sPpm: 8000,
    swsNh3Ppm: 3000,
    swsSteamRateLbHr: 60000,
    sruAcidGasMMscfd: 14,
    sruH2sConcPct: 70,
    sruRecoveryStage: '3-stage+TGTU',
    fccRegenGasMMscfd: 80,
    fccSOxPpm: 800,
    fccNOxPpm: 150,
    heaterFuelGasMMscfd: 30,
    heaterNOxPpm: 60,
    fugitiveVOCLbHr: 45,
    cemsSO2LbHr: 180,
    cemsNOxLbHr: 120,
    cemsCO2TonHr: 280,
    wwFlowGpm: 2500,
    wwOilPpm: 180,
    wwBODPpm: 350,
    wwPhenolPpm: 25,
    wwSulfidePpm: 15,
    flareGasMMscfd: 2.5,
    flareRecoveryPct: 65,
    cogenGasTurbineMw: 80,
    cogenHeatRateBtuKwh: 10500,
    hrsgSteamLbHr: 350000,
};

// ────────────────────────────────────────
const HydrogenSulfurEnvModule: React.FC = () => {
    const [state, setEnv] = useState<EnvState>(defaultEnv);

    const update = useCallback(<K extends keyof EnvState>(k: K, v: EnvState[K]) => {
        setEnv(prev => ({ ...prev, [k]: v }));
    }, []);

    // ── SMR Hydrogen ──
    const smrH2 = useMemo(() => smrHydrogenProduction(
        state.smrFeedMMscfd, state.smrSteamToCarbon, state.smrReformerTempF,
        state.psaRecoveryPct
    ), [state.smrFeedMMscfd, state.smrSteamToCarbon, state.smrReformerTempF, state.psaRecoveryPct]);

    // ── Amine Treating ──
    const amineResult = useMemo(() => {
        const raw = amineCirculationRate(
            state.acidGasRateMMscfd, state.acidGasH2sConcPct, 5, state.amineType, 50, 0.45
        );
        const h2sToSRUMMscfd = state.acidGasRateMMscfd * state.acidGasH2sConcPct / 100;
        const sweetGasMMscfd = state.acidGasRateMMscfd - h2sToSRUMMscfd;
        const regenSteamLbHr = raw.regenerationDutyMMBtuHr * 1e6 / 1100;
        const amineLossGpd = raw.circulationRateGpm * 0.001 * 1440;
        return { h2sToSRUMMscfd, sweetGasMMscfd, regenSteamLbHr, amineLossGpd, ...raw };
    }, [state.acidGasRateMMscfd, state.acidGasH2sConcPct, state.amineCirculationGpm, state.amineType]);

    // ── Sour Water ──
    const swsResult = useMemo(() => {
        const raw = sourWaterStripper(
            state.swsFeedGpm, state.swsH2sPpm, state.swsNh3Ppm, state.swsSteamRateLbHr
        );
        const acidGasToSRUMMscfd = raw.acidGasH2SLbHr * 379.5 / (34 * 24 * 1e6) * 24;
        const strippedWaterGpm = Math.round(state.swsFeedGpm * 0.98);
        const h2sRemovalPct = state.swsH2sPpm > 0 ? (1 - raw.outletH2SPpmw / state.swsH2sPpm) * 100 : 0;
        const recycledWaterGpm = Math.round(strippedWaterGpm * 0.6);
        return { acidGasToSRUMMscfd, strippedWaterGpm, h2sRemovalPct, recycledWaterGpm, ...raw };
    }, [state.swsFeedGpm, state.swsH2sPpm, state.swsNh3Ppm, state.swsSteamRateLbHr]);

    // ── SRU ──
    const sruResult = useMemo(() => {
        const numStages = state.sruRecoveryStage === '2-stage' ? 2 : state.sruRecoveryStage === '3-stage' ? 3 : 4;
        const raw = clausEfficiency(numStages, state.sruH2sConcPct, 0.95);
        const sulfurLtpd = state.sruAcidGasMMscfd * 1e6 * state.sruH2sConcPct / 100 * 34 / (379.5 * 2240) * 32 / 34;
        const sulfurRecoveryPct = raw.overallEfficiency;
        const sulfurProductionLtpd = Math.round(sulfurLtpd * sulfurRecoveryPct / 100);
        const tailGasH2sPpmv = raw.tailGasH2SPct * 10000;
        const so2EmissionsTonsPerYear = Math.round(tailGasH2sPpmv * state.sruAcidGasMMscfd * 0.05);
        const tgtuRequired = numStages < 4 && sulfurRecoveryPct < 99.5;
        return { sulfurRecoveryPct, sulfurProductionLtpd, tailGasH2sPpmv, so2EmissionsTonsPerYear, tgtuRequired };
    }, [state.sruAcidGasMMscfd, state.sruH2sConcPct, state.sruRecoveryStage]);

    // ── Emissions ──
    const emissions = useMemo(() => {
        const raw = refineryEmissionsInventory(
            state.heaterFuelGasMMscfd, 0, 0, 99, 10, 50, 100000
        );
        const totalSO2TonsPerYear = state.cemsSO2LbHr * 8760 / 2000;
        const totalNOxTonsPerYear = state.cemsNOxLbHr * 8760 / 2000;
        const totalCO2TonsPerYear = state.cemsCO2TonHr * 8760;
        const vocTonsPerYear = state.fugitiveVOCLbHr * 8760 / 2000;
        const pmTonsPerYear = raw.pm10Tpy;
        const so2Limit = 500;
        const noxLimit = 200;
        const so2Compliant = totalSO2TonsPerYear <= so2Limit;
        const noxCompliant = totalNOxTonsPerYear <= noxLimit;
        const complianceStatus = so2Compliant && noxCompliant ? 'compliant' : 'non-compliant';
        return { totalSO2TonsPerYear, totalNOxTonsPerYear, totalCO2TonsPerYear, vocTonsPerYear, pmTonsPerYear, so2Limit, noxLimit, so2Compliant, noxCompliant, complianceStatus };
    }, [state]);

    // ── Wastewater ──
    const wwResult = useMemo(() => {
        const raw = wastewaterTreatmentMassBalance(
            state.wwFlowGpm, state.wwOilPpm, state.wwBODPpm, state.wwBODPpm * 2.5, state.wwPhenolPpm, state.wwSulfidePpm
        );
        const oilRemovalPct = state.wwOilPpm > 0 ? (1 - raw.effluentOilPpm / state.wwOilPpm) * 100 : 0;
        const bodRemovalPct = raw.bodRemovalPct;
        const effluentOilPpm = raw.effluentOilPpm;
        const effluentBODPpm = raw.effluentBODPpm;
        const sludgeTonsPerDay = raw.sludgeProductionTpd;
        const dailyCost = state.wwFlowGpm * 0.08 * 1440;
        return { oilRemovalPct, bodRemovalPct, effluentOilPpm, effluentBODPpm, sludgeTonsPerDay, dailyCost };
    }, [state]);

    // ── Flare Recovery ──
    const flareResult = useMemo(() => {
        const recoveredGasMMscfd = state.flareGasMMscfd * state.flareRecoveryPct / 100;
        const flaredGasMMscfd = state.flareGasMMscfd - recoveredGasMMscfd;
        const co2AvoidedTonsPerYear = Math.round(recoveredGasMMscfd * 55 * 365);
        const fuelSavingsDollarsPerDay = recoveredGasMMscfd * 4000;
        return { recoveredGasMMscfd, flaredGasMMscfd, co2AvoidedTonsPerYear, fuelSavingsDollarsPerDay };
    }, [state.flareGasMMscfd, state.flareRecoveryPct]);

    // ── Cogeneration ──
    const cogenResult = useMemo(() => {
        const raw = gasTurbineCHP(state.cogenGasTurbineMw, 35, 80);
        const electricalEfficiencyPct = 35;
        const thermalEfficiencyPct = raw.overallEfficiencyPct - electricalEfficiencyPct;
        const totalEfficiencyPct = raw.overallEfficiencyPct;
        const fuelConsumptionMMBtuHr = raw.fuelInputMMBtuHr;
        return { totalEfficiencyPct, electricalEfficiencyPct, thermalEfficiencyPct, fuelConsumptionMMBtuHr };
    }, [state]);

    // ── Hydrogen Balance ──
    const h2Balance = useMemo(() => {
        const sources = [
            { name: 'SMR', mmscfd: smrH2.h2ProductionMmscfd },
            { name: 'Reformer', mmscfd: 15 },
        ];
        const sinks = [
            { name: 'HDS', mmscfd: 8 }, { name: 'HC', mmscfd: 25 }, { name: 'NHT', mmscfd: 3 },
            { name: 'DHT', mmscfd: 6 }, { name: 'KHT', mmscfd: 2 }, { name: 'Other', mmscfd: 5 },
        ];
        const bal = hydrogenBalance(sources, sinks);
        const hydrogenRecoveryRate = bal.totalConsumption > 0 ? (bal.totalProduction / bal.totalConsumption) * 100 : 0;
        return { ...bal, hydrogenRecoveryRate };
    }, [smrH2.h2ProductionMmscfd]);

    // Chart data
    const h2SourcesData = useMemo(() => [
        { name: 'SMR', mmcfd: smrH2.h2ProductionMmscfd, fill: '#06b6d4' },
        { name: 'Reformer', mmcfd: 15, fill: '#f59e0b' },
        { name: 'Recovery', mmcfd: smrH2.h2ProductionMmscfd * 0.15, fill: '#10b981' },
    ], [smrH2]);

    const h2ConsumersData = useMemo(() => [
        { name: 'Hydrocracker', mmcfd: 25, fill: '#ef4444' },
        { name: 'HDS', mmcfd: 8, fill: '#f59e0b' },
        { name: 'NHT', mmcfd: 3, fill: '#10b981' },
        { name: 'DHT', mmcfd: 6, fill: '#3b82f6' },
        { name: 'Other', mmcfd: 7, fill: '#8b5cf6' },
    ], []);

    const emissionsData = useMemo(() => [
        { name: 'SO₂', value: emissions.totalSO2TonsPerYear, fill: '#ef4444', limit: emissions.so2Limit },
        { name: 'NOx', value: emissions.totalNOxTonsPerYear, fill: '#f59e0b', limit: emissions.noxLimit },
        { name: 'CO₂', value: emissions.totalCO2TonsPerYear / 1000, fill: '#06b6d4', label: 'kT/yr' },
        { name: 'VOC', value: emissions.vocTonsPerYear, fill: '#8b5cf6' },
        { name: 'PM', value: emissions.pmTonsPerYear, fill: '#64748b' },
    ], [emissions]);

    // Slider component (compact)
    const Slider = ({ label, value, min, max, step, onChange, unit = '', colorClass = 'text-slate-300' }: any) => (
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

    const Selector = ({ label, value, options, onChange }: any) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-[10px] bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 font-mono">
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-lg font-bold text-white">6.7–6.8 Hydrogen, Sulfur & Environmental</h2>
                    <p className="text-[11px] text-slate-400">SMR · Amine · SWS · SRU/TGTU · Emissions · Wastewater · Flare · Cogeneration</p>
                </div>
            </div>

            {/* ── Hydrogen & Sulfur Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* SMR Card */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-cyan-400 mb-2">Steam Methane Reformer (SMR)</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <Slider label="Feed Gas" value={state.smrFeedMMscfd} min={5} max={120} step={1}
                            onChange={(v: number) => update('smrFeedMMscfd', v)} unit="MMscfd" colorClass="text-cyan-400" />
                        <Slider label="Steam/Carbon" value={state.smrSteamToCarbon} min={2} max={4} step={0.1}
                            onChange={(v: number) => update('smrSteamToCarbon', v)} colorClass="text-indigo-400" />
                        <Slider label="Reformer Temp" value={state.smrReformerTempF} min={1300} max={1700} step={10}
                            onChange={(v: number) => update('smrReformerTempF', v)} unit="°F" colorClass="text-red-400" />
                        <Slider label="Shift Temp" value={state.smrShiftTempF} min={550} max={800} step={10}
                            onChange={(v: number) => update('smrShiftTempF', v)} unit="°F" colorClass="text-amber-400" />
                        <Slider label="PSA Recovery" value={state.psaRecoveryPct} min={70} max={95} step={1}
                            onChange={(v: number) => update('psaRecoveryPct', v)} unit="%" colorClass="text-emerald-400" />
                    </div>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">H₂ Production</span><span className="text-cyan-400 font-bold">{fmt(smrH2.h2ProductionMmscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">H₂ Purity</span><span>{pct(99.9)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">SMR Efficiency</span><span>{pct(smrH2.efficiencyPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">CO₂ Produced</span><span className="text-red-400">{fmt(smrH2.co2EmissionsTonPerDay, 0)} TPD</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Fuel Gas</span><span>{fmt(smrH2.fuelGasConsumedMmscfd, 1)} MMscfd</span></div>
                    </div>
                </div>

                {/* H2 Balance */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-indigo-400 mb-2">Refinery Hydrogen Balance</h4>
                    <div className="space-y-1 text-[11px] font-mono mb-2">
                        <div className="flex justify-between"><span className="text-slate-400">Total Production</span><span className="text-cyan-400">{fmt(h2Balance.totalProduction, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Total Consumption</span><span className="text-red-400">{fmt(h2Balance.totalConsumption, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Net Balance</span><span className={h2Balance.netBalance >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{fmt(h2Balance.netBalance, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Recovery Rate</span><span>{fmt(h2Balance.hydrogenRecoveryRate, 1)}%</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="text-[11px] text-slate-500 mb-1">Sources</div>
                            <ResponsiveContainer width="100%" height={100}>
                                <BarChart data={h2SourcesData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={8} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={8} width={55} />
                                    <Bar dataKey="mmcfd" radius={[0, 2, 2, 0]}>
                                        {h2SourcesData.map((_, i) => (<rect key={i} fill={COLORS[i % COLORS.length]} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <div className="text-[11px] text-slate-500 mb-1">Consumers</div>
                            <ResponsiveContainer width="100%" height={100}>
                                <BarChart data={h2ConsumersData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={8} />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={8} width={55} />
                                    <Bar dataKey="mmcfd" fill="#ef4444" radius={[0, 2, 2, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Amine + SWS + SRU Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Amine Treating */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-purple-400 mb-2">Amine Treating ({state.amineType})</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Acid Gas Rate</span><span>{fmt(state.acidGasRateMMscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">H₂S Conc</span><span className="text-yellow-400">{pct(state.acidGasH2sConcPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Circulation</span><span>{fmtInt(state.amineCirculationGpm)} GPM</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">H₂S to SRU</span><span className="text-yellow-400">{fmt(amineResult.h2sToSRUMMscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Sweet Gas</span><span className="text-emerald-400">{fmt(amineResult.sweetGasMMscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Regen Steam</span><span>{fmtInt(amineResult.regenSteamLbHr)} lb/hr</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Amine Loss</span><span>{fmt(amineResult.amineLossGpd, 0)} gal/day</span></div>
                    </div>
                </div>

                {/* Sour Water Stripper */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-orange-400 mb-2">Sour Water Stripper</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Feed Rate</span><span>{fmtInt(state.swsFeedGpm)} GPM</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">H₂S in Feed</span><span className="text-yellow-400">{fmtInt(state.swsH2sPpm)} ppm</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">NH₃ in Feed</span><span>{fmtInt(state.swsNh3Ppm)} ppm</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">Acid Gas to SRU</span><span>{fmt(swsResult.acidGasToSRUMMscfd, 2)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Stripped Water</span><span className="text-emerald-400">{fmtInt(swsResult.strippedWaterGpm)} GPM</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Stripping Efficiency</span><span className="text-emerald-400">{pct(swsResult.h2sRemovalPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Recycle to Desalter</span><span>{fmtInt(swsResult.recycledWaterGpm)} GPM</span></div>
                    </div>
                </div>

                {/* SRU / Claus */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-amber-400 mb-2">Sulfur Recovery ({state.sruRecoveryStage})</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Acid Gas Feed</span><span>{fmt(state.sruAcidGasMMscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">H₂S to SRU</span><span>{pct(state.sruH2sConcPct)}</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">Sulfur Recovery</span><span className="text-amber-400 font-bold">{pct(sruResult.sulfurRecoveryPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Sulfur Production</span><span className="text-amber-400">{fmtInt(sruResult.sulfurProductionLtpd)} LT/day</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Tail Gas H₂S</span><span className="text-red-400">{fmt(sruResult.tailGasH2sPpmv, 0)} ppmv</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">SO₂ Emissions</span><span>{fmt(sruResult.so2EmissionsTonsPerYear, 0)} TPY</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">TGTU Required</span><span>{sruResult.tgtuRequired ? '✓ Yes' : '✗ No'}</span></div>
                    </div>
                </div>
            </div>

            {/* ── Emissions Dashboard ── */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <h4 className="text-xs font-bold text-white mb-2">Air Emissions Dashboard — CEMS & Continuous Monitoring</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] text-center font-mono mb-3">
                    <div><div className="text-slate-500">SO₂ (TPY)</div><div className={emissions.so2Compliant ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{fmtInt(emissions.totalSO2TonsPerYear)}</div></div>
                    <div><div className="text-slate-500">NOx (TPY)</div><div className={emissions.noxCompliant ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{fmtInt(emissions.totalNOxTonsPerYear)}</div></div>
                    <div><div className="text-slate-500">CO₂ (kTPY)</div><div className="text-cyan-400 font-bold">{fmt(emissions.totalCO2TonsPerYear / 1000, 0)}</div></div>
                    <div><div className="text-slate-500">VOC</div><div className="text-purple-400 font-bold">{fmtInt(emissions.vocTonsPerYear)} TPY</div></div>
                    <div><div className="text-slate-500">Compliance</div><div className={emissions.complianceStatus === 'compliant' ? 'text-emerald-400' : 'text-red-400'}>{emissions.complianceStatus}</div></div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={emissionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {emissionsData.map((_, i) => (<rect key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Wastewater + Flare + Cogen ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Wastewater */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-blue-400 mb-2">Wastewater Treatment</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Flow Rate</span><span>{fmtInt(state.wwFlowGpm)} GPM</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Oil Removal</span><span className="text-cyan-400">{pct(wwResult.oilRemovalPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">BOD Reduction</span><span className="text-emerald-400">{pct(wwResult.bodRemovalPct)}</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">Effluent Oil</span><span className={wwResult.effluentOilPpm <= 15 ? 'text-emerald-400' : 'text-red-400'}>{fmt(wwResult.effluentOilPpm, 1)} ppm</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Effluent BOD</span><span>{fmt(wwResult.effluentBODPpm, 0)} ppm</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Sludge Production</span><span>{fmt(wwResult.sludgeTonsPerDay, 1)} TPD</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Treatment Cost</span><span>${fmt(wwResult.dailyCost, 0)}/day</span></div>
                    </div>
                </div>

                {/* Flare Gas Recovery */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-pink-400 mb-2">Flare Gas Recovery</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Flare Gas Rate</span><span>{fmt(state.flareGasMMscfd, 1)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Recovery Rate</span><span>{pct(state.flareRecoveryPct)}</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">Gas Recovered</span><span className="text-emerald-400">{fmt(flareResult.recoveredGasMMscfd, 2)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Gas to Flare</span><span className="text-red-400">{fmt(flareResult.flaredGasMMscfd, 2)} MMscfd</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">CO₂ Avoided</span><span className="text-emerald-400">{fmtInt(flareResult.co2AvoidedTonsPerYear)} TPY</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Fuel Gas Savings</span><span className="text-cyan-400">${fmt(flareResult.fuelSavingsDollarsPerDay / 1000, 0)}K/day</span></div>
                    </div>
                </div>

                {/* Cogeneration */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-bold text-emerald-400 mb-2">CHP Cogeneration</h4>
                    <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">GT Output</span><span>{fmtInt(state.cogenGasTurbineMw)} MW</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Heat Rate</span><span>{fmtInt(state.cogenHeatRateBtuKwh)} BTU/kWh</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">HRSG Steam</span><span>{fmt(state.hrsgSteamLbHr / 1000, 0)} Klb/hr</span></div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between"><span className="text-slate-400">CHP Efficiency</span><span className="text-emerald-400 font-bold">{pct(cogenResult.totalEfficiencyPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Electrical Efficiency</span><span>{pct(cogenResult.electricalEfficiencyPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Thermal Efficiency</span><span>{pct(cogenResult.thermalEfficiencyPct)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Fuel Consumption</span><span>{fmt(cogenResult.fuelConsumptionMMBtuHr, 1)} MMBtu/hr</span></div>
                    </div>
                </div>
            </div>

            {/* ── Key Equations ── */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                SMR: CH₄ + H₂O → CO + 3H₂ (ΔH = +206 kJ/mol){' '}
                | WGS: CO + H₂O → CO₂ + H₂ (ΔH = -41 kJ/mol){' '}
                | Claus: 2H₂S + SO₂ → 3S + 2H₂O (ΔH = -146 kJ/mol){' '}
                | Amine: H₂S + R₃N ↔ R₃NH⁺ + HS⁻ (reversible){' '}
                | Flare Recovery: Gas Recovery = 1 − (1 − η)ⁿ cycles{' '}
                | CHP: η_total = (W_electrical + Q_thermal) / Q_fuel{' '}
                | SWS: H₂S removal = 1 − exp(−NTU) (stripping efficiency){' '}
                | TGTU: SCOT process — tail gas H₂S → SO₂ → H₂S → Claus recycle → {'>'}99.9% recovery{' '}
                | Emissions: SO₂ (TPY) = Σ (fuel sulfur × 2 × 365) − sulfur recovery
            </div>
        </div>
    );
};

export default HydrogenSulfurEnvModule;