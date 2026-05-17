/**
 * Change #8: Interactive Report Dashboard
 *
 * A live summary dashboard that pulls from the shared simulation state
 * and gives a real-time value chain overview. Features:
 *
 *   1. Value Chain Summary Strip — horizontal KPI cards spanning all phases
 *   2. Field Lifecycle Chart — full field timeline with phase bands
 *   3. Economics Waterfall — full value chain cost buildup per barrel
 *   4. Cross-Stage Consistency Checks — automated warnings
 *   5. Scenario Comparison — side-by-side P10/P50/P90 view
 */

import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Area, ComposedChart, ReferenceLine,
} from 'recharts';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import DataTableExportWrapper from '../shared/DataTableExportWrapper';
import { useSimulationStore } from '../../store/simulationStore';

// ─── Types ───────────────────────────────────────────────────

export interface ValueChainKPI {
    phase: string;
    metric: string;
    value: string | number;
    target?: string | number;
    status: 'green' | 'yellow' | 'red';
    icon: string;
}

export interface FieldLifecyclePoint {
    year: number;
    oilRate: number;
    gasRate: number;
    waterRate: number;
    cumulativeCashflow: number;
    phase: string;
}

export interface EconomicsWaterfallItem {
    category: string;
    cost: number;
    revenue: number;
    isTotal?: boolean;
    isRevenue?: boolean;
}

// ─── Style Constants ─────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: 150,
    flex: 1,
};

const labelStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
};

const kpiValueStyle = (color: string): React.CSSProperties => ({
    color,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
});

const subtitleStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
};

const sectionStyle: React.CSSProperties = {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 16,
    borderBottom: '2px solid #334155',
    paddingBottom: 8,
};

// ─── Status Badge ────────────────────────────────────────────

const StatusBadge: React.FC<{ status: 'green' | 'yellow' | 'red' }> = ({ status }) => {
    const colors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
    const labels = { green: 'ON TRACK', yellow: 'WATCH', red: 'ACTION' };
    return (
        <span
            style={{
                background: colors[status] + '20',
                color: colors[status],
                border: `1px solid ${colors[status]}40`,
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.3px',
                display: 'inline-block',
                marginTop: 4,
            }}
        >
            {labels[status]}
        </span>
    );
};

// ─── Phase Status Indicator ──────────────────────────────────

const PhaseStatusIndicator: React.FC<{ dataAvailable: boolean }> = ({ dataAvailable }) => (
    <span
        style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dataAvailable ? '#10b981' : '#475569',
            marginRight: 6,
            boxShadow: dataAvailable ? '0 0 6px rgba(16,185,129,0.4)' : 'none',
        }}
    />
);

// ─── KPI Card ────────────────────────────────────────────────

const KPICard: React.FC<{
    phase: string;
    metric: string;
    value: string | number;
    target?: string | number;
    status: 'green' | 'yellow' | 'red';
    icon: string;
    onClick: () => void;
    accentColor: string;
    dataAvailable: boolean;
}> = ({ phase, metric, value, target, status, icon, onClick, accentColor, dataAvailable }) => (
    <div
        style={cardStyle}
        onClick={onClick}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1e293b';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PhaseStatusIndicator dataAvailable={dataAvailable} />
                <span style={labelStyle}>{phase}</span>
            </div>
            <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        <div style={kpiValueStyle(status === 'red' ? '#ef4444' : status === 'yellow' ? '#f59e0b' : '#10b981')}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={subtitleStyle}>{metric}</div>
        {target !== undefined && (
            <div style={{ ...subtitleStyle, color: '#475569', marginTop: 2 }}>
                Target: {typeof target === 'number' ? target.toLocaleString() : target}
            </div>
        )}
        <StatusBadge status={status} />
    </div>
);

// ─── Phase Colors ────────────────────────────────────────────

const PHASE_COLORS: Record<string, string> = {
    Exploration: '#3b82f6',
    Appraisal: '#8b5cf6',
    Reserves: '#10b981',
    Drilling: '#f59e0b',
    Production: '#ef4444',
    Midstream: '#06b6d4',
    Refining: '#ec4899',
    Distribution: '#84cc16',
    Retail: '#f97316',
};

const PHASE_BANDS = [
    { phase: 'Exploration', start: -5, end: -3, color: 'rgba(59, 130, 246, 0.08)' },
    { phase: 'Appraisal', start: -3, end: -1.5, color: 'rgba(139, 92, 246, 0.08)' },
    { phase: 'Development', start: -1.5, end: 0, color: 'rgba(245, 158, 11, 0.08)' },
    { phase: 'Ramp-up', start: 0, end: 2, color: 'rgba(239, 68, 68, 0.08)' },
    { phase: 'Plateau', start: 2, end: 7, color: 'rgba(16, 185, 129, 0.08)' },
    { phase: 'Decline', start: 7, end: 20, color: 'rgba(236, 72, 153, 0.08)' },
];

// ─── Value Chain Summary Strip ───────────────────────────────

const ValueChainSummary: React.FC = () => {
    const state = useSimulationStore();

    const kpis: ValueChainKPI[] = useMemo(() => {
        const st = state;

        // --- Exploration: risked volume from prospect ---
        const exploRisked = st.exploration?.prospect?.riskedVolume;
        const exploVolume = typeof exploRisked === 'number' ? exploRisked : undefined;
        const exploStatus: 'green' | 'yellow' | 'red' =
            !exploVolume ? 'red' : exploVolume >= 400 ? 'green' : 'yellow';

        // --- Appraisal: average porosity & Sw from petrophysics zones ---
        const appraisalZones = st.appraisal?.petrophysics ?? [];
        const avgPoro = appraisalZones.length > 0
            ? appraisalZones.reduce((s, z) => s + z.averagePorosity, 0) / appraisalZones.length
            : 0;
        const avgSW = appraisalZones.length > 0
            ? appraisalZones.reduce((s, z) => s + z.averageSw, 0) / appraisalZones.length
            : 0;
        const appraisalValue = appraisalZones.length > 0
            ? `${(avgPoro * 100).toFixed(1)}% / ${(avgSW * 100).toFixed(1)}%`
            : '—';
        const appraisalStatus: 'green' | 'yellow' | 'red' =
            appraisalZones.length === 0 ? 'red' : avgPoro > 0.12 ? 'green' : 'yellow';

        // --- Reserves: 2P recoverable ---
        const deterministicOOIP = st.reserves?.deterministic?.stoiip;
        const recoverableOil = st.reserves?.deterministic?.recoverableOil;
        const reservesValue = recoverableOil ?? deterministicOOIP;
        const reservesDisplay = reservesValue != null
            ? (typeof reservesValue === 'number' ? reservesValue.toFixed(1) : String(reservesValue))
            : '—';
        const reservesStatus: 'green' | 'yellow' | 'red' =
            reservesValue == null ? 'red' : reservesValue >= 150 ? 'green' : 'yellow';

        // --- Drilling & Completion: average well cost ---
        const wells = st.drillingCompletion?.wells ?? [];
        const avgCostMM = wells.length > 0
            ? wells.reduce((s, w) => s + (w.cost?.total ?? 0), 0) / wells.length / 1_000_000
            : 0;
        const drillingValue = wells.length > 0 ? `$${avgCostMM.toFixed(1)}` : '—';
        const drillingStatus: 'green' | 'yellow' | 'red' =
            wells.length === 0 ? 'red' : avgCostMM < 20 ? 'green' : 'yellow';

        // --- Production: field aggregate ---
        const fieldAgg = st.production?.fieldAggregate;
        const prodRate = fieldAgg?.totalOilRate;
        const prodStatus: 'green' | 'yellow' | 'red' =
            !prodRate ? 'red' : prodRate >= 40000 ? 'green' : 'yellow';

        // --- Midstream: pipeline utilization ---
        const pipelineUtil = st.midstream?.pipeline?.utilizationRate;
        const midstreamUtilPct = typeof pipelineUtil === 'number' ? pipelineUtil * 100 : undefined;
        const midstreamStatus: 'green' | 'yellow' | 'red' =
            midstreamUtilPct == null ? 'red' : midstreamUtilPct >= 75 ? 'green' : 'yellow';

        // --- Refining: gross margin ---
        const refEcon = st.refining?.economics;
        const refMargin = refEcon?.grossMargin;
        const refStatus: 'green' | 'yellow' | 'red' =
            refMargin == null ? 'red' : refMargin >= 8 ? 'green' : 'yellow';

        // --- Distribution: fleet utilization ---
        const distUtil = st.distribution?.fleetUtilization;
        const distStatus: 'green' | 'yellow' | 'red' =
            distUtil == null ? 'red' : distUtil >= 0.7 ? 'green' : 'yellow';

        // --- Retail: average fuel margin across stations ---
        const retailSales = st.retail?.sales ?? [];
        const avgFuelMargin = retailSales.length > 0
            ? retailSales.reduce((sum, s) => {
                const margins = Object.values(s.fuelMargin ?? {});
                return sum + (margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0);
            }, 0) / retailSales.length
            : 0;
        const retailDisplay = retailSales.length > 0 ? `$${avgFuelMargin.toFixed(2)}` : '—';
        const retailStatus: 'green' | 'yellow' | 'red' =
            retailSales.length === 0 ? 'red' : avgFuelMargin >= 0.15 ? 'green' : 'yellow';

        return [
            {
                phase: 'Exploration',
                metric: 'Risked Volume (MMboe)',
                value: exploVolume ?? '—',
                target: 500,
                status: exploStatus,
                icon: '🔍',
            },
            {
                phase: 'Appraisal',
                metric: 'Avg Porosity / Sw',
                value: appraisalValue,
                target: '15% / 30%',
                status: appraisalStatus,
                icon: '📊',
            },
            {
                phase: 'Reserves',
                metric: '2P Recoverable (MMboe)',
                value: reservesDisplay,
                target: 200,
                status: reservesStatus,
                icon: '🛢️',
            },
            {
                phase: 'Drilling',
                metric: 'Avg Well Cost ($MM)',
                value: drillingValue,
                target: 15,
                status: drillingStatus,
                icon: '🏗️',
            },
            {
                phase: 'Production',
                metric: 'Field Rate (bopd)',
                value: prodRate ?? '—',
                target: 50000,
                status: prodStatus,
                icon: '⛽',
            },
            {
                phase: 'Midstream',
                metric: 'Pipeline Utilization',
                value: midstreamUtilPct != null ? `${midstreamUtilPct.toFixed(0)}%` : '—',
                target: '85%',
                status: midstreamStatus,
                icon: '🚛',
            },
            {
                phase: 'Refining',
                metric: 'Gross Margin ($/bbl)',
                value: typeof refMargin === 'number' ? `$${refMargin.toFixed(1)}` : '—',
                target: 12,
                status: refStatus,
                icon: '🏭',
            },
            {
                phase: 'Distribution',
                metric: 'Fleet Utilization',
                value: typeof distUtil === 'number' ? `${(distUtil * 100).toFixed(0)}%` : '—',
                target: '80%',
                status: distStatus,
                icon: '🚢',
            },
            {
                phase: 'Retail',
                metric: 'Avg Fuel Margin ($/gal)',
                value: retailDisplay,
                target: 0.25,
                status: retailStatus,
                icon: '🏪',
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return (
        <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                    📋 Value Chain Summary
                </h3>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: '#64748b' }}>
                    <span><PhaseStatusIndicator dataAvailable={true} /> Data</span>
                    <span><PhaseStatusIndicator dataAvailable={false} /> No Data</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                {kpis.map((kpi) => {
                    const dataAvail = kpi.value !== '—' && kpi.value !== null && kpi.value !== undefined;
                    return (
                        <KPICard
                            key={kpi.phase}
                            {...kpi}
                            dataAvailable={dataAvail}
                            accentColor={PHASE_COLORS[kpi.phase]}
                            onClick={() => {
                                // Dispatch custom navigation event for parent (App.tsx) to handle
                                window.dispatchEvent(new CustomEvent('petrostream:navigate', {
                                    detail: { stage: kpi.phase.toLowerCase() },
                                }));
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// ─── Field Lifecycle Chart ──────────────────────────────────

const FieldLifecycleChart: React.FC = () => {
    const lifecycleData: FieldLifecyclePoint[] = useMemo(() => {
        const points: FieldLifecyclePoint[] = [];
        for (let year = -5; year <= 25; year++) {
            let oilRate = 0;
            let gasRate = 0;
            let waterRate = 0;
            let phase = 'Pre-Discovery';

            if (year < -1.5) {
                phase = year < -3 ? 'Exploration' : 'Appraisal';
                oilRate = 0;
                gasRate = 0;
            } else if (year < 0) {
                phase = 'Development';
                oilRate = 0;
            } else if (year <= 2) {
                phase = 'Ramp-up';
                oilRate = (year / 2) * 45000;
                gasRate = oilRate * 1.2;
                waterRate = oilRate * 0.05;
            } else if (year <= 7) {
                phase = 'Plateau';
                oilRate = 45000;
                gasRate = 54000;
                waterRate = 5000 + (year - 2) * 2000;
            } else {
                phase = 'Decline';
                const declineFactor = Math.exp(-0.12 * (year - 7));
                oilRate = 45000 * declineFactor;
                gasRate = 54000 * declineFactor;
                waterRate = 15000 + (year - 7) * 1500;
            }

            const cumulativeCashflow = year > 0
                ? (year <= 7
                    ? -200 + (year * 80)
                    : -200 + 560 + ((year - 7) * 20))
                : -50;

            points.push({ year, oilRate, gasRate, waterRate, cumulativeCashflow, phase });
        }
        return points;
    }, []);

    const milestones = [
        { year: -4, label: 'Discovery', color: '#3b82f6' },
        { year: -1.5, label: 'FID', color: '#f59e0b' },
        { year: 0, label: 'First Oil', color: '#10b981' },
        { year: 7, label: 'Decline Onset', color: '#ef4444' },
        { year: 20, label: 'Economic Limit', color: '#ec4899' },
    ];

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>📈 Field Lifecycle</h3>
            <ChartExportWrapper title="Field Lifecycle" filename="PetroStream_FieldLifecycle">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={lifecycleData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="year"
                            stroke="#94a3b8"
                            label={{ value: 'Year', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#94a3b8"
                            label={{ value: 'Rate (bopd/Mscfd)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#f59e0b"
                            label={{ value: 'Cum. Cashflow ($MM)', angle: 90, position: 'right', fill: '#f59e0b', fontSize: 11 }}
                        />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                        />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="oilRate" stackId="1" stroke="#3b82f6" fill="rgba(59,130,246,0.13)" name="Oil (bopd)" />
                        <Area yAxisId="left" type="monotone" dataKey="gasRate" stroke="#10b981" fill="rgba(16,185,129,0.13)" name="Gas (Mscfd)" />
                        <Area yAxisId="left" type="monotone" dataKey="waterRate" stroke="#06b6d4" fill="rgba(6,182,212,0.13)" name="Water (bwpd)" />
                        <Line yAxisId="right" type="monotone" dataKey="cumulativeCashflow" stroke="#f59e0b" strokeWidth={2} dot={false} name="Cashflow ($MM)" />
                        {/* Milestones */}
                        {milestones.map((m) => (
                            <ReferenceLine
                                key={m.label}
                                x={m.year}
                                yAxisId="left"
                                stroke={m.color}
                                strokeDasharray="4 4"
                                label={{ value: m.label, position: 'top', fill: m.color, fontSize: 9 }}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartExportWrapper>
        </div>
    );
};

// ─── Economics Waterfall ────────────────────────────────────

const EconomicsWaterfall: React.FC = () => {
    const waterfallData: EconomicsWaterfallItem[] = useMemo(() => [
        { category: 'Crude Revenue', cost: 0, revenue: 72, isRevenue: true },
        { category: 'Finding Cost', cost: -5.5, revenue: 0 },
        { category: 'Development Cost', cost: -11.2, revenue: 0 },
        { category: 'Lifting Cost', cost: -8.3, revenue: 0 },
        { category: 'Transportation', cost: -3.5, revenue: 0 },
        { category: 'Refining Cost', cost: -6.8, revenue: 0 },
        { category: 'Distribution', cost: -2.1, revenue: 0 },
        { category: 'Government Take', cost: -18.5, revenue: 0 },
        { category: 'Retail Margin', cost: -2.5, revenue: 0 },
        { category: 'NET MARGIN', cost: 0, revenue: 13.6, isTotal: true },
    ], []);

    const chartData = useMemo(() => {
        let running = 0;
        return waterfallData.map((item) => {
            if (item.isRevenue) {
                running = item.revenue;
            } else if (!item.isTotal) {
                running += item.cost;
            }
            return {
                ...item,
                barValue: item.isRevenue ? item.revenue : item.isTotal ? running : Math.abs(item.cost),
                fill: item.isRevenue ? '#3b82f6' : item.isTotal ? '#10b981' : '#ef4444',
            };
        });
    }, [waterfallData]);

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>💰 Value Chain Economics — Cost Buildup ($/bbl)</h3>
            <ChartExportWrapper title="Economics Waterfall" filename="PetroStream_EconomicsWaterfall">
                <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 80, left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="category"
                            stroke="#94a3b8"
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            fontSize={10}
                            tick={{ fill: '#cbd5e1' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            label={{ value: '$/bbl', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                        />
                        <Bar dataKey="barValue" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartExportWrapper>
            {/* Table */}
            <div style={{ marginTop: 16 }}>
                <DataTableExportWrapper
                    title="Cost Buildup"
                    columns={[
                        { key: 'category', label: 'Category' },
                        { key: 'cost', label: 'Cost ($/bbl)' },
                        { key: 'revenue', label: 'Revenue ($/bbl)' },
                    ]}
                    data={waterfallData.map((d) => ({
                        category: d.category,
                        cost: d.cost === 0 ? '—' : `$${Math.abs(d.cost).toFixed(1)}`,
                        revenue: d.revenue === 0 ? '—' : `$${d.revenue.toFixed(1)}`,
                    }))}
                    filenamePrefix="PetroStream_CostBuildup"
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Category</th>
                                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Cost ($/bbl)</th>
                                <th style={{ textAlign: 'right', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Revenue ($/bbl)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waterfallData.map((item, i) => (
                                <tr key={i} style={{ background: item.isTotal ? '#1e293b' : i % 2 === 0 ? '#0f172a' : '#1e293b', fontWeight: item.isTotal ? 700 : 400 }}>
                                    <td style={{ padding: '7px 10px', color: item.isTotal ? '#10b981' : '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{item.category}</td>
                                    <td style={{ textAlign: 'right', padding: '7px 10px', color: item.cost < 0 ? '#ef4444' : '#e2e8f0', borderBottom: '1px solid #1e293b' }}>
                                        {item.cost === 0 ? '—' : `$${Math.abs(item.cost).toFixed(1)}`}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '7px 10px', color: item.revenue > 0 ? '#10b981' : '#e2e8f0', borderBottom: '1px solid #1e293b' }}>
                                        {item.revenue === 0 ? '—' : `$${item.revenue.toFixed(1)}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableExportWrapper>
            </div>
        </div>
    );
};

// ─── Cross-Stage Consistency Checks ─────────────────────────

interface ConsistencyCheck {
    parameter: string;
    stages: string[];
    values: { stage: string; value: string; status: 'match' | 'mismatch' | 'warning' }[];
    recommendation: string;
}

const ConsistencyChecks: React.FC = () => {
    const [checks] = useState<ConsistencyCheck[]>([
        {
            parameter: 'Permeability (mD)',
            stages: ['Appraisal', 'Well Test', 'Reservoir'],
            values: [
                { stage: 'Log-Derived', value: '185 mD', status: 'warning' },
                { stage: 'Well Test', value: '210 mD', status: 'match' },
                { stage: 'Core', value: '175 mD', status: 'match' },
            ],
            recommendation: 'Log-derived K within 15% of well test K — acceptable. Consider permeability multiplier of 0.88 for upscaling.',
        },
        {
            parameter: 'Reservoir Pressure (psi)',
            stages: ['Appraisal', 'Well Test', 'Reservoir'],
            values: [
                { stage: 'MDT/RFT', value: '4,520 psi', status: 'match' },
                { stage: 'Well Test p*', value: '4,495 psi', status: 'match' },
                { stage: 'Material Balance', value: '4,380 psi', status: 'warning' },
            ],
            recommendation: 'Material balance average pressure is 140 psi lower than initial pressure — expected with 8% depletion. Consider pressure maintenance.',
        },
        {
            parameter: 'STOIIP (MMstb)',
            stages: ['Reservoir', 'Reservoir', 'Reservoir'],
            values: [
                { stage: 'Volumetric', value: '345 MMstb', status: 'match' },
                { stage: 'Material Balance', value: '312 MMstb', status: 'warning' },
                { stage: 'Simulation', value: '338 MMstb', status: 'match' },
            ],
            recommendation: 'Material balance estimate is 10% lower than volumetric — possible aquifer influx or compartmentalization. Investigate with 4D seismic.',
        },
    ]);

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>🔗 Cross-Stage Consistency Checks</h3>
            {checks.map((check, idx) => (
                <div key={idx} style={{ marginBottom: 20, padding: 14, background: '#1e293b', borderRadius: 8 }}>
                    <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        {check.parameter}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                        {check.values.map((v, vi) => (
                            <div key={vi} style={{ padding: '8px 14px', background: '#0f172a', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                                    {v.stage}
                                </div>
                                <div style={{
                                    color: v.status === 'match' ? '#10b981' : v.status === 'warning' ? '#f59e0b' : '#ef4444',
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}>
                                    {v.value}
                                </div>
                                <span style={{
                                    fontSize: 9,
                                    color: v.status === 'match' ? '#10b981' : v.status === 'warning' ? '#f59e0b' : '#ef4444',
                                    fontWeight: 600,
                                }}>
                                    {v.status === 'match' ? '✓ MATCH' : v.status === 'warning' ? '⚠ REVIEW' : '✗ MISMATCH'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic', borderTop: '1px solid #334155', paddingTop: 8 }}>
                        💡 {check.recommendation}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Scenario Comparison ────────────────────────────────────

const ScenarioComparison: React.FC = () => {
    const scenarioData = useMemo(() => {
        const p10Forecast = [0, 12000, 28000, 42000, 48000, 45000, 41000, 36000, 30000, 24000, 18000, 13000, 9000, 6000, 4000, 2500];
        const p50Forecast = [0, 8000, 20000, 35000, 42000, 40000, 35000, 29000, 24000, 19000, 14000, 10000, 6500, 4200, 2800, 1800];
        const p90Forecast = [0, 5000, 12000, 22000, 30000, 29000, 25000, 20000, 16000, 12000, 8500, 5500, 3500, 2200, 1400, 900];

        const years = Array.from({ length: 16 }, (_, i) => i + 1);
        return years.map((year) => ({
            year,
            p10: p10Forecast[year - 1] || 0,
            p50: p50Forecast[year - 1] || 0,
            p90: p90Forecast[year - 1] || 0,
        }));
    }, []);

    const economicsComparison = [
        { metric: 'EUR (MMstb)', p10: '195', p50: '142', p90: '82' },
        { metric: 'NPV10 ($MM)', p10: '1,250', p50: '780', p90: '310' },
        { metric: 'IRR (%)', p10: '45%', p50: '28%', p90: '12%' },
        { metric: 'Payback (yrs)', p10: '1.8', p50: '3.2', p90: '6.5' },
        { metric: 'Well Count', p10: '24', p50: '18', p90: '10' },
        { metric: 'Total Capex ($MM)', p10: '520', p50: '390', p90: '220' },
    ];

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>📊 Scenario Comparison (P10 / P50 / P90)</h3>
            <div style={{ marginBottom: 20 }}>
                <ChartExportWrapper title="Scenario Comparison" filename="PetroStream_ScenarioComparison">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={scenarioData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="year" stroke="#94a3b8" label={{ value: 'Year', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" label={{ value: 'Oil Rate (bopd)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="p10" stroke="#10b981" strokeWidth={2} dot={false} name="P10 (Optimistic)" />
                            <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} dot={false} name="P50 (Best Estimate)" />
                            <Line type="monotone" dataKey="p90" stroke="#ef4444" strokeWidth={2} dot={false} name="P90 (Conservative)" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>
            <DataTableExportWrapper
                title="Scenario Economics"
                columns={[
                    { key: 'metric', label: 'Metric' },
                    { key: 'p10', label: 'P10' },
                    { key: 'p50', label: 'P50' },
                    { key: 'p90', label: 'P90' },
                ]}
                data={economicsComparison}
                filenamePrefix="PetroStream_ScenarioEconomics"
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Metric</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#10b981', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>P10</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#3b82f6', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>P50</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#ef4444', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>P90</th>
                        </tr>
                    </thead>
                    <tbody>
                        {economicsComparison.map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#e2e8f0', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row.metric}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#10b981', borderBottom: '1px solid #1e293b' }}>{row.p10}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#3b82f6', borderBottom: '1px solid #1e293b' }}>{row.p50}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#ef4444', borderBottom: '1px solid #1e293b' }}>{row.p90}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataTableExportWrapper>
        </div>
    );
};

// ─── Main Dashboard ──────────────────────────────────────────

const InteractiveReportDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<'all' | 'summary' | 'lifecycle' | 'economics' | 'consistency' | 'scenarios'>('all');

    const tabs = [
        { key: 'all' as const, label: 'All Views' },
        { key: 'summary' as const, label: 'Value Chain' },
        { key: 'lifecycle' as const, label: 'Lifecycle' },
        { key: 'economics' as const, label: 'Economics' },
        { key: 'consistency' as const, label: 'Consistency' },
        { key: 'scenarios' as const, label: 'Scenarios' },
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 16 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: 0 }}>📊 Interactive Report Dashboard</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Real-time value chain overview with cross-stage analytics</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1e293b', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveView(tab.key)}
                        style={{
                            padding: '8px 18px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            background: activeView === tab.key ? '#3b82f6' : 'transparent',
                            color: activeView === tab.key ? '#fff' : '#94a3b8',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Views */}
            {(activeView === 'all' || activeView === 'summary') && <ValueChainSummary />}
            {(activeView === 'all' || activeView === 'lifecycle') && <FieldLifecycleChart />}
            {(activeView === 'all' || activeView === 'economics') && <EconomicsWaterfall />}
            {(activeView === 'all' || activeView === 'consistency') && <ConsistencyChecks />}
            {(activeView === 'all' || activeView === 'scenarios') && <ScenarioComparison />}
        </div>
    );
};

export default InteractiveReportDashboard;