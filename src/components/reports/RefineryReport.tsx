/**
 * Change #8: Refinery Report Generator
 *
 * Crude slate summary, unit throughput, product yield table,
 * gasoline/diesel blending, hydrogen balance, margin analysis,
 * energy efficiency, environmental emissions.
 */

import React from 'react';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};

const RefineryReport: React.FC = () => {
    const throughput = 325000;
    const utilization = 0.92;
    const grossMargin = 12.45;
    const netMargin = 6.82;
    const eii = 85.2;

    const productYieldData = [
        { name: 'LPG', value: 3.5, color: '#ef4444' },
        { name: 'Naphtha', value: 8.2, color: '#f59e0b' },
        { name: 'Gasoline', value: 42.5, color: '#3b82f6' },
        { name: 'Jet/Kero', value: 10.0, color: '#8b5cf6' },
        { name: 'Diesel', value: 25.0, color: '#10b981' },
        { name: 'Fuel Oil', value: 5.5, color: '#64748b' },
        { name: 'Other', value: 5.3, color: '#ec4899' },
    ];

    const unitData = [
        { unit: 'CDU', feed: 325, utilization: 92, severity: 'N/A' },
        { unit: 'VDU', feed: 145, utilization: 85, severity: 'N/A' },
        { unit: 'FCC', feed: 72, utilization: 88, severity: '72% conv.' },
        { unit: 'Reformer', feed: 45, utilization: 91, severity: '98 RON' },
        { unit: 'HDS (Diesel)', feed: 85, utilization: 87, severity: '10 ppm S' },
        { unit: 'Hydrocracker', feed: 38, utilization: 82, severity: '65% conv.' },
    ];

    const blendData = [
        { grade: 'Regular 87', octane: 87.2, rvp: 9.8, sulfur: 8, giveaway: 0.2 },
        { grade: 'Plus 89', octane: 89.3, rvp: 9.6, sulfur: 7, giveaway: 0.3 },
        { grade: 'Premium 93', octane: 93.5, rvp: 9.4, sulfur: 6, giveaway: 0.5 },
    ];

    const emissionsData = [
        { source: 'Furnaces', co2: 2.8, so2: 0.15, nox: 0.08 },
        { source: 'FCC Regenerator', co2: 1.2, so2: 0.08, nox: 0.12 },
        { source: 'SRU Incinerator', co2: 0.3, so2: 0.02, nox: 0.01 },
        { source: 'Flare', co2: 0.2, so2: 0.01, nox: 0.02 },
    ];

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Refinery Operations Summary',
                paragraphs: [
                    `Total Crude Throughput: ${throughput.toLocaleString()} kbpd | Utilization: ${(utilization * 100).toFixed(1)}%`,
                    `Gross Margin: $${grossMargin}/bbl | Net Margin: $${netMargin}/bbl | EII: ${eii}`,
                ],
            },
            {
                heading: 'Crude Slate',
                tables: [{
                    caption: 'Crude Slate Summary',
                    header: ['Crude', 'Volume (kbpd)', 'API', 'Sulfur (wt%)', 'Price ($/bbl)'],
                    data: [
                        ['Arab Light', '120', '33', '1.8', '78.50'],
                        ['Basrah Medium', '85', '29', '2.5', '74.20'],
                        ['Maya', '55', '22', '3.3', '68.90'],
                        ['Eagle Ford', '40', '47', '0.2', '82.10'],
                        ['WTI', '25', '40', '0.4', '80.50'],
                    ],
                }],
            },
            {
                heading: 'Unit Throughput',
                tables: [{
                    caption: 'Unit Performance Summary',
                    header: ['Unit', 'Feed (kbpd)', 'Utilization (%)', 'Severity'],
                    data: unitData.map(u => [u.unit, u.feed.toString(), u.utilization.toString(), u.severity]),
                }],
            },
            {
                heading: 'Gasoline Blending',
                tables: [{
                    caption: 'Gasoline Blend Quality',
                    header: ['Grade', 'Octane (RON+MON)/2', 'RVP (psi)', 'Sulfur (ppm)', 'Giveaway'],
                    data: blendData.map(b => [b.grade, b.octane.toString(), b.rvp.toString(), b.sulfur.toString(), `${b.giveaway} oct`]),
                }],
            },
            {
                heading: 'Hydrogen Balance',
                paragraphs: [
                    'H2 Production (Reformer): 82 MMscfd | Consumption: 78 MMscfd | Surplus: 4 MMscfd',
                    'H2 Purity: 99.9% | Cost: $1.45/Mscf',
                ],
            },
            {
                heading: 'Emissions',
                tables: [{
                    caption: 'Environmental Emissions (million tonnes/year)',
                    header: ['Source', 'CO₂', 'SO₂', 'NOx'],
                    data: emissionsData.map(e => [e.source, e.co2.toString(), e.so2.toString(), e.nox.toString()]),
                }],
            },
            { heading: 'Recommendations', paragraphs: ['1. Maya crude discount widening — increase Maya run rate 10% to capture margin benefit.', '2. FCC conversion at 72% — catalyst addition rate can be optimized to reach 74% without hardware changes.', '3. Premium 93 giveaway at 0.5 octane — reduce reformate by 1% volume to trim giveaway.', '4. Hydrogen surplus of 4 MMscfd — explore selling excess to third party or expanding hydrocracker throughput.'] },
        ];

        const doc: ReportDocument = {
            config: { projectName: 'Refinery Operations', wellName: 'Refinery A', reportTitle: 'Monthly Refinery Performance Report', reportType: 'Refinery Report', author: 'PetroStream User', classification: 'CONFIDENTIAL', accentColor: '#f59e0b' },
            executiveSummary: `Refinery A throughput: ${throughput.toLocaleString()} kbpd (${(utilization * 100).toFixed(1)}% utilization). Gross margin $${grossMargin}/bbl, net $${netMargin}/bbl. EII: ${eii}. All units operating normally. Premium gasoline giveaway reduced to 0.5 octane.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_Refinery_RefineryA.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>🏭 Refinery Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Throughput • Yields • Blending • Economics • Emissions</p>
                </div>
                <button onClick={handleGeneratePDF} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#f59e0b', color: '#000' }}>📄 Generate PDF Report</button>
            </div>

            {/* KPIs */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📊 Operations Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: 'Throughput', value: `${throughput.toLocaleString()} kbpd`, color: '#3b82f6' },
                        { label: 'Utilization', value: `${(utilization * 100).toFixed(1)}%`, color: '#10b981' },
                        { label: 'Gross Margin', value: `$${grossMargin}/bbl`, color: '#f59e0b' },
                        { label: 'Net Margin', value: `$${netMargin}/bbl`, color: '#8b5cf6' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Yield */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📦 Product Yield Distribution (% Volume)</h3>
                <ChartExportWrapper title="Product Yields" filename="PetroStream_RefineryYields">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={productYieldData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" label={{ value: '% Volume', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [`${val}%`, 'Yield']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {productYieldData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* Unit Throughput */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>⚙️ Unit Performance</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Unit</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Feed (kbpd)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Utilization (%)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitData.map((u, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{u.unit}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{u.feed.toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: u.utilization >= 90 ? '#10b981' : '#f59e0b', borderBottom: '1px solid #1e293b' }}>{u.utilization}%</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{u.severity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Gasoline Blending */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>⛽ Gasoline Blending</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Grade</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Octane (AKI)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>RVP (psi)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Sulfur (ppm)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Giveaway</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blendData.map((b, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{b.grade}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{b.octane}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{b.rvp}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: b.sulfur <= 10 ? '#10b981' : '#f59e0b', borderBottom: '1px solid #1e293b' }}>{b.sulfur}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#f59e0b', borderBottom: '1px solid #1e293b' }}>{b.giveaway} oct</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Emissions */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🌿 Environmental Emissions</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Source</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>CO₂ (Mt/yr)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>SO₂ (kt/yr)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>NOx (kt/yr)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emissionsData.map((e, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{e.source}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{e.co2}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{e.so2}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{e.nox}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RefineryReport;