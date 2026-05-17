/**
 * Change #8: Drilling Report Generator
 *
 * Casing diagram, trajectory plot, time-depth curve, mud program,
 * BHA summary, cementing, completion summary, cost breakdown, lessons learned.
 */

import React from 'react';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};

const DrillingReport: React.FC = () => {
    const tvdDepth = 12500;
    const plannedDays = 48;
    const actualDays = 55;
    const npt = 7;
    const afeCost = 22.5;
    const actualCost = 24.8;

    const timeDepthData = [
        { day: 0, planned: 0, actual: 0 },
        { day: 5, planned: 2500, actual: 2200 },
        { day: 12, planned: 5500, actual: 5000 },
        { day: 20, planned: 8000, actual: 7500 },
        { day: 30, planned: 10500, actual: 9800 },
        { day: 38, planned: 11500, actual: 10800 },
        { day: 48, planned: 12500, actual: null },
        { day: 55, planned: null, actual: 12500 },
    ];

    const casingData = [
        { string: 'Conductor', size: '20"', shoeDepth: 150, grade: 'X52', weight: 94 },
        { string: 'Surface', size: '13-3/8"', shoeDepth: 2500, grade: 'L80', weight: 54.5 },
        { string: 'Intermediate', size: '9-5/8"', shoeDepth: 8000, grade: 'L80', weight: 40 },
        { string: 'Production', size: '7"', shoeDepth: tvdDepth, grade: 'L80', weight: 26 },
    ];

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Well Summary',
                paragraphs: [
                    `Well: WT-01 | Field: North Block | TVD: ${tvdDepth.toLocaleString()} ft`,
                    `Spud Date: 2025-11-15 | TD reached: 2026-01-05 | Total Days: ${actualDays}`,
                    `AFE Cost: $${afeCost} MM | Actual: $${actualCost} MM | NPT: ${npt} days (${((npt / actualDays) * 100).toFixed(1)}%)`,
                ],
            },
            {
                heading: 'Casing Program',
                tables: [{
                    caption: 'Casing Summary',
                    header: ['String', 'Size', 'Setting Depth (ft)', 'Grade', 'Weight (lb/ft)'],
                    data: casingData.map(c => [c.string, c.size, c.shoeDepth.toLocaleString(), c.grade, c.weight.toString()]),
                }],
            },
            {
                heading: 'Mud Program',
                paragraphs: [
                    'Surface (0-2,500 ft): Water-based mud, 9.0-9.5 ppg, gel-natural mud, viscosity 40-50 sec/qt',
                    'Intermediate (2,500-8,000 ft): WBM, 10.5-11.5 ppg, polymer-based, fluid loss < 10 cc/30min',
                    'Production (8,000-12,500 ft): Oil-based mud, 11.5-12.5 ppg, low solids, 50/50 oil-water ratio, HPHT filtrate < 5 cc',
                ],
            },
            {
                heading: 'Bit Record',
                tables: [{
                    caption: 'Bit Run Summary',
                    header: ['Section', 'Bit Type', 'Size', 'Footage (ft)', 'Hours', 'ROP (ft/hr)', 'Dull Grade'],
                    data: [
                        ['Surface', 'PDC', '17-1/2"', '2,500', '45', '55.6', '1-1-WT'],
                        ['Intermediate', 'PDC', '12-1/4"', '5,500', '120', '45.8', '1-2-WT'],
                        ['Production', 'PDC', '8-1/2"', '4,500', '180', '25.0', '2-2-WT'],
                    ],
                }],
            },
            {
                heading: 'Cementing Summary',
                tables: [{
                    caption: 'Cementing Operations',
                    header: ['String', 'Slurry Type', 'Top of Cement (ft)', 'Volume (bbls)', 'Plug Bump (psi)', 'WOC (hrs)', 'Bond Log'],
                    data: [
                        ['Surface', 'Class G + 2% CaCl2', 'Surface', '250', '1,200', '8', 'Good'],
                        ['Intermediate', 'Class G + 35% silica flour', '1,500', '480', '1,800', '12', 'Good'],
                        ['Production', 'Class G + 35% silica flour', '7,000', '320', '2,200', '16', 'Excellent'],
                    ],
                }],
            },
            {
                heading: 'Cost Summary',
                tables: [{
                    caption: 'Cost Breakdown (AFE vs Actual)',
                    header: ['Category', 'AFE ($MM)', 'Actual ($MM)', 'Variance ($MM)'],
                    data: [
                        ['Drilling', '12.0', '13.2', '+1.2'],
                        ['Completion', '4.5', '5.0', '+0.5'],
                        ['Logging', '2.0', '2.1', '+0.1'],
                        ['Testing', '1.5', '1.6', '+0.1'],
                        ['Services', '1.5', '1.8', '+0.3'],
                        ['Contingency', '1.0', '1.1', '+0.1'],
                        ['TOTAL', afeCost.toFixed(1), actualCost.toFixed(1), `+${(actualCost - afeCost).toFixed(1)}`],
                    ],
                }],
            },
            { heading: 'Lessons Learned', paragraphs: ['1. Intermediate section: Bit dulling suggests harder formation — consider premium PDC with improved abrasion resistance for next well.', '2. Lost circulation at 8,200 ft resolved with LCM pill within 4 hours — stock LCM on location proactively for future wells.', '3. OBM performance excellent — repeat for production section on offset wells.', '4. BHA design: increased WOB from 15 to 22 klb improved ROP by 30% — standardize higher WOB practice.'] },
        ];

        const doc: ReportDocument = {
            config: { projectName: 'Drilling Operations', wellName: 'Well WT-01', reportTitle: 'Drilling & Completion Report', reportType: 'Drilling Report', author: 'PetroStream User', classification: 'CONFIDENTIAL', accentColor: '#ef4444' },
            executiveSummary: `Well WT-01 drilled to TD ${tvdDepth.toLocaleString()} ft in ${actualDays} days (${(actualDays - plannedDays)} days > plan). AFE $${afeCost} MM, actual $${actualCost} MM (+${((actualCost / afeCost - 1) * 100).toFixed(1)}%). NPT ${npt} days (${((npt / actualDays) * 100).toFixed(1)}%). No well control events. All objectives met.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_Drilling_WT01.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>🏗️ Drilling Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Casing • Time-Depth • BHA • Cost • Lessons Learned</p>
                </div>
                <button onClick={handleGeneratePDF} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#ef4444', color: '#fff' }}>📄 Generate PDF Report</button>
            </div>

            {/* Well Summary */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📋 Well Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: 'TVD', value: `${tvdDepth.toLocaleString()} ft`, color: '#3b82f6' },
                        { label: 'Drilling Days', value: `${actualDays} days`, color: '#f59e0b' },
                        { label: 'NPT', value: `${npt} days (${((npt / actualDays) * 100).toFixed(0)}%)`, color: '#ef4444' },
                        { label: 'Actual Cost', value: `$${actualCost} MM`, color: '#10b981' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 16, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time-Depth Curve */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📈 Time-Depth Curve (Planned vs Actual)</h3>
                <ChartExportWrapper title="Time-Depth Curve" filename="PetroStream_TimeDepth">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={timeDepthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94a3b8" label={{ value: 'Days', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8' } }} />
                            <YAxis stroke="#94a3b8" label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} reversed domain={[0, tvdDepth + 500]} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Planned" />
                            <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* Casing Program */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🔩 Casing Program</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>String</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Size</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Shoe Depth (ft)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Grade</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Weight (lb/ft)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {casingData.map((c, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{c.string}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{c.size}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{c.shoeDepth.toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{c.grade}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{c.weight}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cost Summary */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>💰 Cost Summary (AFE vs Actual)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>AFE ($MM)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Actual ($MM)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Variance ($MM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Drilling', '12.0', '13.2', '+1.2'],
                            ['Completion', '4.5', '5.0', '+0.5'],
                            ['Logging', '2.0', '2.1', '+0.1'],
                            ['Testing', '1.5', '1.6', '+0.1'],
                            ['Services', '1.5', '1.8', '+0.3'],
                            ['Contingency', '1.0', '1.1', '+0.1'],
                            ['TOTAL', afeCost.toFixed(1), actualCost.toFixed(1), `+${(actualCost - afeCost).toFixed(1)}`],
                        ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b', fontWeight: i === 6 ? 700 : 400 }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: i === 6 ? 700 : 600, borderBottom: '1px solid #1e293b' }}>{row[0]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[1]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[2]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: row[3].startsWith('+') ? '#ef4444' : '#10b981', borderBottom: '1px solid #1e293b' }}>{row[3]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrillingReport;