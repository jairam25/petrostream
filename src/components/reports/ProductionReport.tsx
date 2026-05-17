/**
 * Change #8: Production Report Generator
 *
 * Field production summary, rates/cumulatives, decline curve analysis,
 * well performance table, water cut/GOR trends, EUR estimates, facilities.
 */

import React, { useMemo } from 'react';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Area,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};

const ProductionReport: React.FC = () => {
    const currentOilRate = 48000;
    const currentGasRate = 125;
    const currentWaterRate = 18500;
    const cumOil = 185;
    const recoveryFactor = 0.28;
    const waterCut = 27.8;
    const gor = 2604;

    const productionData = useMemo(() => [
        { year: 2018, oil: 35000, gas: 85, water: 5000 },
        { year: 2019, oil: 45000, gas: 105, water: 8000 },
        { year: 2020, oil: 52000, gas: 130, water: 11000 },
        { year: 2021, oil: 50000, gas: 125, water: 14000 },
        { year: 2022, oil: 51000, gas: 128, water: 16000 },
        { year: 2023, oil: 49000, gas: 122, water: 17500 },
        { year: 2024, oil: 48500, gas: 126, water: 18200 },
        { year: 2025, oil: 48000, gas: 125, water: 18500 },
    ], []);

    const wellData = [
        { well: 'WT-01', rate: 8500, cum: 32.4, wc: 24, gor: 2550, status: 'Flowing', lastTest: '2026-01-10' },
        { well: 'WT-02', rate: 7200, cum: 28.1, wc: 28, gor: 2600, status: 'Flowing', lastTest: '2026-01-12' },
        { well: 'WT-03', rate: 6500, cum: 25.8, wc: 30, gor: 2650, status: 'ESP', lastTest: '2026-01-08' },
        { well: 'WT-04', rate: 5800, cum: 22.0, wc: 32, gor: 2750, status: 'Flowing', lastTest: '2026-01-15' },
        { well: 'WT-05', rate: 5200, cum: 18.5, wc: 35, gor: 2400, status: 'ESP', lastTest: '2026-01-11' },
        { well: 'WT-06', rate: 4800, cum: 16.2, wc: 18, gor: 2900, status: 'Flowing', lastTest: '2026-01-09' },
        { well: 'WT-07', rate: 4200, cum: 14.8, wc: 28, gor: 2580, status: 'Gas Lift', lastTest: '2026-01-14' },
        { well: 'WT-08', rate: 3800, cum: 12.5, wc: 22, gor: 2400, status: 'Flowing', lastTest: '2026-01-13' },
        { well: 'WT-09', rate: 1200, cum: 8.2, wc: 45, gor: 3200, status: 'ESP', lastTest: '2026-01-07' },
        { well: 'WT-10', rate: 800, cum: 6.5, wc: 52, gor: 3500, status: 'Intermittent', lastTest: '2026-01-05' },
    ];

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Field Production Summary',
                paragraphs: [
                    `Current Oil Rate: ${currentOilRate.toLocaleString()} bopd | Gas: ${currentGasRate} MMscf/d | Water: ${currentWaterRate.toLocaleString()} bwpd`,
                    `Cumulative Oil: ${cumOil} MMstb | Recovery Factor: ${(recoveryFactor * 100).toFixed(1)}% | Water Cut: ${waterCut.toFixed(1)}% | GOR: ${gor} scf/stb`,
                ],
                tables: [{
                    caption: 'Production Key Metrics',
                    header: ['Metric', 'Value', 'Units'],
                    data: [
                        ['Oil Rate', currentOilRate.toLocaleString(), 'bopd'],
                        ['Gas Rate', currentGasRate.toFixed(1), 'MMscf/d'],
                        ['Water Rate', currentWaterRate.toLocaleString(), 'bwpd'],
                        ['Cumulative Oil', cumOil.toLocaleString(), 'MMstb'],
                        ['Recovery Factor', `${(recoveryFactor * 100).toFixed(1)}`, '%'],
                        ['Water Cut', waterCut.toFixed(1), '%'],
                        ['GOR', gor.toLocaleString(), 'scf/stb'],
                    ],
                }],
            },
            {
                heading: 'Decline Curve Analysis',
                paragraphs: [
                    'Fitted Model: Arps Hyperbolic | Di = 0.18 year⁻¹ | b = 0.35 | qi = 52,000 bopd',
                    'EUR (Economic Limit 200 bopd): 215 MMstb | Remaining Reserves: 30 MMstb',
                    'Forecast: Plateau through 2026, decline onset Q1 2027, economic limit 2038',
                ],
            },
            {
                heading: 'Well Performance',
                tables: [{
                    caption: 'Individual Well Performance',
                    header: ['Well', 'Rate (bopd)', 'Cum (MMstb)', 'WC (%)', 'GOR', 'Status', 'Last Test'],
                    data: wellData.map(w => [w.well, w.rate.toLocaleString(), w.cum.toString(), w.wc.toString(), w.gor.toLocaleString(), w.status, w.lastTest]),
                }],
            },
            { heading: 'Recommendations', paragraphs: ['1. Wells WT-09 and WT-10 showing water cut > 45% — consider water shut-off treatment or conversion to injector.', '2. ESP in WT-03 and WT-05 running > 800 days since last pump change — schedule replacement in Q2 2026.', '3. Gas lift in WT-07 delivering sub-optimal drawdown — optimize injection rate and review gas allocation.', '4. Field voidage replacement ratio at 0.92 — increase injection at I-03 to maintain reservoir pressure.'] },
        ];

        const doc: ReportDocument = {
            config: { projectName: 'Production Operations', wellName: 'Field X', reportTitle: 'Monthly Production Report', reportType: 'Production Report', author: 'PetroStream User', classification: 'CONFIDENTIAL', accentColor: '#3b82f6' },
            executiveSummary: `Field X current rate: ${currentOilRate.toLocaleString()} bopd, cumulative ${cumOil} MMstb (${(recoveryFactor * 100).toFixed(1)}% RF). ${waterCut.toFixed(1)}% water cut. EUR estimated at 215 MMstb. 10 wells active — 6 flowing, 3 ESP, 1 gas lift. No production shortfalls this period.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_Production_FieldX.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>⚙️ Production Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Rates • Decline • Wells • EUR • Facilities</p>
                </div>
                <button onClick={handleGeneratePDF} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#3b82f6', color: '#fff' }}>📄 Generate PDF Report</button>
            </div>

            {/* KPI Cards */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📊 Field Production Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: 'Oil Rate', value: `${currentOilRate.toLocaleString()} bopd`, color: '#3b82f6' },
                        { label: 'Cumulative', value: `${cumOil} MMstb`, color: '#10b981' },
                        { label: 'Water Cut', value: `${waterCut.toFixed(1)}%`, color: '#f59e0b' },
                        { label: 'Recovery Factor', value: `${(recoveryFactor * 100).toFixed(1)}%`, color: '#8b5cf6' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Production History Chart */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📈 Production History</h3>
                <ChartExportWrapper title="Production History" filename="PetroStream_ProductionHistory">
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis yAxisId="left" stroke="#94a3b8" label={{ value: 'Oil (bopd)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" label={{ value: 'Water (bwpd)', angle: 90, position: 'insideRight', style: { fill: '#94a3b8' } }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Bar yAxisId="right" dataKey="water" fill="#ef4444" name="Water Rate" radius={[4, 4, 0, 0]} />
                            <Area yAxisId="left" type="monotone" dataKey="oil" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.2} name="Oil Rate" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* Well Performance Table */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🛢️ Individual Well Performance</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>Well</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>Rate (bopd)</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>Cum (MMstb)</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>WC (%)</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>GOR</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>Status</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: 10, borderBottom: '2px solid #334155' }}>Last Test</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wellData.map((w, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                    <td style={{ padding: '5px 8px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{w.well}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{w.rate.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{w.cum.toFixed(1)}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: w.wc > 40 ? '#ef4444' : '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{w.wc}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{w.gor.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: '#10b981', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{w.status}</td>
                                    <td style={{ textAlign: 'center', padding: '5px 8px', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{w.lastTest}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionReport;