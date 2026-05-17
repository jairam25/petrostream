/**
 * Change #8: Retail Report Generator
 *
 * Station performance dashboard, fuel volume by grade, inside sales,
 * UST system status, pricing analysis, environmental compliance.
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

const RetailReport: React.FC = () => {
    const totalFuelVolume = 285000;
    const insideSales = 142000;
    const totalRevenue = 1.32;
    const totalProfit = 0.18;
    const avgMargin = 0.42;

    const fuelByGrade = [
        { name: 'Regular 87', volume: 155000, revenue: 0.62, color: '#3b82f6' },
        { name: 'Plus 89', volume: 65000, revenue: 0.28, color: '#8b5cf6' },
        { name: 'Premium 93', volume: 40000, revenue: 0.19, color: '#a855f7' },
        { name: 'Diesel', volume: 25000, revenue: 0.12, color: '#10b981' },
    ];

    const pricingData = [
        { month: 'Jul', rack: 3.15, retail: 3.59, margin: 0.44 },
        { month: 'Aug', rack: 3.22, retail: 3.62, margin: 0.40 },
        { month: 'Sep', rack: 3.18, retail: 3.58, margin: 0.40 },
        { month: 'Oct', rack: 3.25, retail: 3.65, margin: 0.40 },
        { month: 'Nov', rack: 3.30, retail: 3.68, margin: 0.38 },
        { month: 'Dec', rack: 3.28, retail: 3.70, margin: 0.42 },
    ];

    const ustData = [
        { tank: 'Tank 1 (Reg)', capacity: 20000, current: 12500, ullage: 62, leakTest: '2026-01-08', status: 'OK' },
        { tank: 'Tank 2 (Prem)', capacity: 12000, current: 4800, ullage: 40, leakTest: '2026-01-08', status: 'OK' },
        { tank: 'Tank 3 (Diesel)', capacity: 10000, current: 6200, ullage: 62, leakTest: '2026-01-15', status: 'OK' },
    ];

    const insideSalesData = [
        { category: 'Food Service', revenue: 38000, margin: 55 },
        { category: 'Beverages', revenue: 32000, margin: 52 },
        { category: 'Snacks', revenue: 28000, margin: 45 },
        { category: 'Tobacco', revenue: 22000, margin: 18 },
        { category: 'Automotive', revenue: 12000, margin: 40 },
        { category: 'Other', revenue: 10000, margin: 35 },
    ];

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Station Performance Summary',
                paragraphs: [
                    `Total Fuel Volume: ${totalFuelVolume.toLocaleString()} gal/month | Inside Sales: $${insideSales.toLocaleString()}`,
                    `Total Revenue: $${totalRevenue.toFixed(2)}M | Total Profit: $${totalProfit.toFixed(2)}M | Avg Fuel Margin: $${avgMargin.toFixed(2)}/gal`,
                    'Station: PetroStream Station #0042 | Location: Houston, TX | Report Period: December 2025',
                ],
            },
            {
                heading: 'Fuel Sales by Grade',
                tables: [{
                    caption: 'Fuel Volume and Revenue by Grade',
                    header: ['Grade', 'Volume (gal)', 'Revenue ($M)', 'Avg Price ($/gal)'],
                    data: fuelByGrade.map(f => [f.name, f.volume.toLocaleString(), f.revenue.toFixed(2), (f.revenue * 1000000 / f.volume).toFixed(2)]),
                }],
            },
            {
                heading: 'Pricing Analysis',
                tables: [{
                    caption: 'Monthly Pricing Trend ($/gal)',
                    header: ['Month', 'Rack Cost', 'Retail Price', 'Margin'],
                    data: pricingData.map(p => [p.month, p.rack.toFixed(2), p.retail.toFixed(2), p.margin.toFixed(2)]),
                }],
            },
            {
                heading: 'UST System Status',
                paragraphs: ['All tanks compliant with 40 CFR 280. Last inspection: December 2025. No ATG alarms this period.'],
                tables: [{
                    caption: 'Underground Storage Tank Status',
                    header: ['Tank', 'Capacity (gal)', 'Current (gal)', 'Ullage (%)', 'Last Leak Test', 'Status'],
                    data: ustData.map(u => [u.tank, u.capacity.toLocaleString(), u.current.toLocaleString(), `${u.ullage}%`, u.leakTest, u.status]),
                }],
            },
            {
                heading: 'Inside Sales',
                tables: [{
                    caption: 'Inside Sales by Category',
                    header: ['Category', 'Revenue ($)', 'Margin (%)'],
                    data: insideSalesData.map(i => [i.category, `$${i.revenue.toLocaleString()}`, `${i.margin}%`]),
                }],
            },
            {
                heading: 'Environmental Compliance',
                paragraphs: [
                    'ATG Alarm History: 0 alarms in reporting period',
                    'Spill Incidents: 0',
                    'Last Inspection: December 2025 — All tests passed',
                    'Monthly SIR (Statistical Inventory Reconciliation): Passed for all tanks',
                ],
            },
            { heading: 'Recommendations', paragraphs: ['1. Diesel volume trending upward (12% YoY) — consider adding DEF at pump to capture additional revenue.', '2. Food service margin at 55% — expand hot food program with breakfast items to grow this high-margin category.', '3. Tank 2 ullage at 40% — optimize delivery scheduling to reduce working capital tied up in inventory.', '4. Premium margin strength sustained — maintain competitive positioning with nearby stations.'] },
        ];

        const doc: ReportDocument = {
            config: { projectName: 'Retail Operations', wellName: 'Station #0042', reportTitle: 'Monthly Retail Performance Report', reportType: 'Retail Report', author: 'PetroStream User', classification: 'INTERNAL', accentColor: '#8b5cf6' },
            executiveSummary: `Station #0042 December performance: ${totalFuelVolume.toLocaleString()} gal fuel sold, $${insideSales.toLocaleString()} inside sales. Total revenue $${totalRevenue.toFixed(2)}M, profit $${totalProfit.toFixed(2)}M. Avg fuel margin $${avgMargin.toFixed(2)}/gal. All UST systems compliant, zero spills/incidents.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_Retail_Station0042.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>🏪 Retail Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Fuel Sales • Inside Sales • Pricing • UST • Compliance</p>
                </div>
                <button onClick={handleGeneratePDF} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#8b5cf6', color: '#fff' }}>📄 Generate PDF Report</button>
            </div>

            {/* KPIs */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📊 Station Performance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: 'Fuel Volume', value: `${totalFuelVolume.toLocaleString()} gal`, color: '#3b82f6' },
                        { label: 'Inside Sales', value: `$${insideSales.toLocaleString()}`, color: '#10b981' },
                        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}M`, color: '#f59e0b' },
                        { label: 'Avg Margin', value: `$${avgMargin.toFixed(2)}/gal`, color: '#8b5cf6' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 16, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fuel by Grade */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>⛽ Fuel Volume by Grade</h3>
                <ChartExportWrapper title="Fuel Sales by Grade" filename="PetroStream_FuelByGrade">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={fuelByGrade} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="#94a3b8" label={{ value: 'Volume (gal)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [val.toLocaleString(), 'Volume']} />
                            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                                {fuelByGrade.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* Inside Sales */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🛍️ Inside Sales by Category</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Revenue</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Gross Margin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insideSalesData.map((i, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{i.category}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>${i.revenue.toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: i.margin >= 45 ? '#10b981' : '#f59e0b', borderBottom: '1px solid #1e293b' }}>{i.margin}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* UST Status */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🛢️ UST System Status</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Tank</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Capacity (gal)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Current (gal)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Ullage (%)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Last Test</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ustData.map((u, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{u.tank}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{u.capacity.toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{u.current.toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{u.ullage}%</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{u.leakTest}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#10b981', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{u.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Environmental */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🌿 Environmental Compliance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>ATG ALARMS</div>
                        <div style={{ color: '#10b981', fontSize: 24, fontWeight: 700 }}>0</div>
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>This reporting period</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>SPILL INCIDENTS</div>
                        <div style={{ color: '#10b981', fontSize: 24, fontWeight: 700 }}>0</div>
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>This reporting period</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetailReport;