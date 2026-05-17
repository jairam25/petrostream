/**
 * Change #8: Well Test Report Generator
 *
 * Test summary, pressure/rate plots, Horner plot, IPR curve, results table,
 * flow regime diagnostics, PVT summary, recommendations.
 */

import React, { useMemo } from 'react';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ScatterChart, Scatter,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};

const WellTestReport: React.FC = () => {
    // Well test parameters — defaults until wired to store
    const kh = 1850;
    const k = 92.5;
    const skin = -1.8;
    const wellboreStorage = 0.012;
    const reservoirPressure = 4820;
    const radiusOfInvestigation = 1250;
    const flowEfficiency = 1.15;

    const hornerData = useMemo(() => {
        const pts: { ht: number; pws: number }[] = [];
        for (let i = 100; i >= 0.1; i -= 0.5) {
            pts.push({ ht: Math.log10(i), pws: 4800 + 45 * Math.log10(i) + (Math.random() - 0.5) * 5 });
        }
        return pts;
    }, []);

    const iprData = useMemo(() => {
        const pr = 5000;
        const pb = 2800;
        const qmax = 4500;
        const pts: { p: number; q: number }[] = [];
        for (let i = 0; i <= 20; i++) {
            const pwf = pr - (pr - 0) * i / 20;
            let q: number;
            if (pwf > pb) {
                q = qmax * (1 - 0.2 * (pwf / pr) - 0.8 * (pwf / pr) ** 2) * (pr - pwf) / pr;
            } else {
                q = qmax * (1 - 0.2 * (pwf / pr) - 0.8 * (pwf / pr) ** 2);
            }
            pts.push({ p: pwf, q: Math.max(0, q) });
        }
        return pts;
    }, []);

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Test Summary',
                paragraphs: [
                    'Test Type: Pressure Build-Up (PBU)',
                    'Test Interval: 10,200 - 10,650 ft MD',
                    'Test Date: 2026-01-15 | Duration: 72 hours | Gauge: Quartz, 0.01 psi resolution',
                    `Reservoir Pressure (p*): ${reservoirPressure} psi | Flow Efficiency: ${flowEfficiency}`,
                ],
            },
            {
                heading: 'Analysis Results',
                tables: [{
                    caption: 'Well Test Analysis Results',
                    header: ['Parameter', 'Value', 'Units'],
                    data: [
                        ['Kh (permeability-thickness)', kh.toFixed(0), 'mD·ft'],
                        ['K (permeability)', k.toFixed(1), 'mD'],
                        ['Skin Factor', skin.toFixed(1), 'dimensionless'],
                        ['Wellbore Storage (C)', wellboreStorage.toFixed(4), 'bbl/psi'],
                        ['Reservoir Pressure (p*)', reservoirPressure.toString(), 'psi'],
                        ['Radius of Investigation', radiusOfInvestigation.toString(), 'ft'],
                        ['Flow Efficiency', flowEfficiency.toFixed(2), 'dimensionless'],
                    ],
                }],
            },
            { heading: 'Flow Regime Interpretation', paragraphs: ['Early-time: Wellbore storage dominant (unit slope on log-log).', 'Middle-time: Infinite-acting radial flow (IARF) — derivative stabilization used for Kh.', 'Late-time: Boundary effects — slight derivative upturn suggests single sealing fault at ~800 ft.'] },
            {
                heading: 'PVT Summary',
                tables: [{
                    caption: 'PVT Fluid Properties',
                    header: ['Property', 'Value', 'Units'],
                    data: [
                        ['Oil API Gravity', '35', '°API'],
                        ['Solution GOR', '850', 'scf/stb'],
                        ['Bubble Point (Pb)', '2,800', 'psi'],
                        ['Oil FVF (Bo)', '1.32', 'rb/stb'],
                        ['Oil Viscosity (μo)', '0.65', 'cp'],
                    ],
                }],
            },
            { heading: 'Recommendations', paragraphs: ['Skin = -1.8 indicates stimulated wellbore — no stimulation needed at this time.', 'Flow efficiency 1.15 confirms slight stimulation benefit.', 'Recommend repeating PBU in 6 months to monitor reservoir pressure decline.', 'Consider longer shut-in to detect boundaries if interference becomes a concern.'] },
        ];

        const doc: ReportDocument = {
            config: { projectName: 'Well Testing', wellName: 'Well WT-01', reportTitle: 'Well Test Analysis Report', reportType: 'Well Test Report', author: 'PetroStream User', classification: 'CONFIDENTIAL', accentColor: '#10b981' },
            executiveSummary: `PBU analysis: Kh = ${kh} mD·ft, K = ${k.toFixed(1)} mD, Skin = ${skin}, p* = ${reservoirPressure} psi. Negative skin indicates stimulated wellbore. Flow efficiency ${flowEfficiency} > 1.0. No boundary issues within ${radiusOfInvestigation} ft radius.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_WellTest_WT01.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>💧 Well Test Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>PBU Analysis • Horner • IPR • Flow Regimes</p>
                </div>
                <button onClick={handleGeneratePDF} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#10b981', color: '#fff' }}>📄 Generate PDF Report</button>
            </div>

            {/* Results Summary */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📊 Analysis Results</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: 'Kh', value: `${kh} mD·ft`, color: '#3b82f6' },
                        { label: 'Permeability', value: `${k.toFixed(1)} mD`, color: '#10b981' },
                        { label: 'Skin', value: skin.toFixed(1), color: skin < 0 ? '#10b981' : '#ef4444' },
                        { label: 'p*', value: `${reservoirPressure} psi`, color: '#f59e0b' },
                    ].map(item => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Horner Plot */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📈 Horner Plot</h3>
                <ChartExportWrapper title="Horner Plot" filename="PetroStream_Horner">
                    <ResponsiveContainer width="100%" height={280}>
                        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="ht" type="number" domain={[0, 'auto']} stroke="#94a3b8" label={{ value: '(tp+Δt)/Δt', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8' } }} />
                            <YAxis dataKey="pws" stroke="#94a3b8" label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Scatter name="Data" data={hornerData} fill="#3b82f6" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* IPR Curve */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>💧 IPR Curve (Inflow Performance)</h3>
                <ChartExportWrapper title="IPR Curve" filename="PetroStream_IPR">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={iprData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="q" stroke="#94a3b8" label={{ value: 'Rate (stb/d)', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8' } }} />
                            <YAxis dataKey="p" stroke="#94a3b8" label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Line type="monotone" dataKey="p" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
            </div>

            {/* Detailed Results Table */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📋 Detailed Results</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Parameter</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Value</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Permeability-Thickness (Kh)', kh.toFixed(0), 'mD·ft'],
                            ['Permeability (K)', k.toFixed(1), 'mD'],
                            ['Skin Factor', skin.toFixed(1), '—'],
                            ['Wellbore Storage', wellboreStorage.toFixed(4), 'bbl/psi'],
                            ['Reservoir Pressure (p*)', reservoirPressure.toString(), 'psi'],
                            ['Radius of Investigation', radiusOfInvestigation.toString(), 'ft'],
                            ['Flow Efficiency', flowEfficiency.toFixed(2), '—'],
                        ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[0]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[1]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{row[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WellTestReport;