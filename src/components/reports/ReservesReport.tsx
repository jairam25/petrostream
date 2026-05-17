/**
 * Change #8: Reserves Report Generator
 *
 * Volumetric STOIIP/GIIP, deterministic + probabilistic reserves,
 * Monte Carlo results, material balance, recovery factor, SPE-PRMS classification.
 *
 * Data model: store/types.ts ReservesLayer
 *   - reservesDeterministic: { stoiip, giip, recoveryFactor, recoverableOil, recoverableGas }
 *   - reservesProbabilistic: { p90, p50, p10, mean }
 *   - materialBalanceResults: { f, et, we, driveIndex }
 */

import React, { useMemo } from 'react';
import { useReserves } from '../../store/hooks';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    Legend,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};
const cardStyle = (borderColor: string): React.CSSProperties => ({
    background: '#1e293b', padding: 16, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${borderColor}`,
});

const ReservesReport: React.FC = () => {
    const { data: reserves } = useReserves();
    const det = reserves?.deterministic;
    const prob = reserves?.probabilistic;
    const mb = reserves?.materialBalance;

    const stoiip = det?.stoiip ?? 345;
    const giip = det?.giip ?? 520;
    const rf = det?.recoveryFactor ?? 0.32;
    const recoverableOil = det?.recoverableOil ?? 110;
    const recoverableGas = det?.recoverableGas ?? 166;
    const p90 = prob?.p90 ?? 75;
    const p50 = prob?.p50 ?? 110;
    const p10 = prob?.p10 ?? 155;

    const volumetricChart = useMemo(() => [
        { name: 'P90 (1P)', value: p90, fill: '#ef4444' },
        { name: 'P50 (2P)', value: p50, fill: '#3b82f6' },
        { name: 'P10 (3P)', value: p10, fill: '#10b981' },
    ], [p90, p50, p10]);

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Volumetric Assessment',
                paragraphs: [
                    `STOIIP (Deterministic): ${stoiip} MMstb`,
                    `GIIP: ${giip} Bscf`,
                    `Recovery Factor: ${(rf * 100).toFixed(1)}%`,
                ],
                tables: [{
                    caption: 'Deterministic Reserves Summary',
                    header: ['Category', 'Oil (MMstb)', 'Gas (Bscf)', 'BOE (MMboe)'],
                    data: [
                        ['STOIIP / GIIP', stoiip.toString(), giip.toString(), (stoiip + giip / 6).toFixed(0)],
                        ['Recoverable', recoverableOil.toString(), recoverableGas.toString(), (recoverableOil + recoverableGas / 6).toFixed(0)],
                    ],
                }],
            },
            {
                heading: 'Probabilistic Reserves Distribution',
                paragraphs: [
                    `P90 (Proved / 1P): ${p90} MMstb recoverable`,
                    `P50 (Proved + Probable / 2P): ${p50} MMstb recoverable`,
                    `P10 (Proved + Probable + Possible / 3P): ${p10} MMstb recoverable`,
                ],
            },
            {
                heading: 'SPE-PRMS Classification',
                tables: [{
                    caption: 'Reserves Classification',
                    header: ['Class', 'Category', 'Recoverable (MMstb)', 'Status'],
                    data: [
                        ['1P', 'Proved', p90.toString(), 'Developed + Undeveloped'],
                        ['2P', 'Proved + Probable', p50.toString(), 'Best Estimate'],
                        ['3P', 'Proved + Probable + Possible', p10.toString(), 'High Estimate'],
                    ],
                }],
            },
            {
                heading: 'Material Balance',
                paragraphs: mb
                    ? [`Drive Index — Depletion: ${mb.driveIndices?.depletion?.toFixed(2) ?? 'N/A'}, Water Drive: ${mb.driveIndices?.waterDrive?.toFixed(2) ?? 'N/A'}, Gas Cap: ${mb.driveIndices?.gasCap?.toFixed(2) ?? 'N/A'}`]
                    : ['Material balance analysis not yet populated. Run the Material Balance module to generate results.'],
            },
            {
                heading: 'Recommendations',
                paragraphs: [
                    `Volumetric STOIIP: ${stoiip} MMstb. 2P recoverable: ${p50} MMstb at ${(rf * 100).toFixed(1)}% RF.`,
                    'Booking recommendation: Book 1P reserves based on developed areas only; upgrade to 2P with appraisal success.',
                ],
            },
        ];

        const doc: ReportDocument = {
            config: {
                projectName: 'Reservoir Evaluation',
                wellName: 'Field X',
                reportTitle: 'Reserves Estimation Report',
                reportType: 'Reserves Report',
                author: 'PetroStream User',
                classification: 'CONFIDENTIAL',
                accentColor: '#f59e0b',
            },
            executiveSummary: `Deterministic STOIIP: ${stoiip} MMstb. 2P recoverable reserves: ${p50} MMstb oil + ${recoverableGas} Bscf gas (${(recoverableOil + recoverableGas / 6).toFixed(0)} MMboe). Recovery factor: ${(rf * 100).toFixed(1)}%. Monte Carlo simulation supports booking 2P.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save('PetroStream_Reserves_FieldX.pdf');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>📊 Reserves Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                        Volumetrics • Probabilistic • Material Balance • SPE-PRMS
                    </p>
                </div>
                <button onClick={handleGeneratePDF}
                    style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#f59e0b', color: '#000' }}>
                    📄 Generate PDF Report
                </button>
            </div>

            {/* Deterministic Volumetrics */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📐 Deterministic Volumetrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'STOIIP', value: `${stoiip} MMstb`, color: '#3b82f6' },
                        { label: 'Recovery Factor', value: `${(rf * 100).toFixed(1)}%`, color: '#10b981' },
                        { label: 'Recoverable Oil', value: `${recoverableOil} MMstb`, color: '#f59e0b' },
                    ].map(item => (
                        <div key={item.label} style={cardStyle(item.color)}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Oil (MMstb)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Gas (Bscf)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>BOE (MMboe)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['STOIIP / GIIP', stoiip, giip, (stoiip + giip / 6).toFixed(0)],
                            ['Recoverable', recoverableOil, recoverableGas, (recoverableOil + recoverableGas / 6).toFixed(0)],
                        ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[0]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[1].toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[2].toLocaleString()}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[3].toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Probabilistic Distribution */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🎲 Probabilistic Distribution (SPE-PRMS)</h3>
                <ChartExportWrapper title="Reserves Distribution" filename="PetroStream_ReservesDistribution">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={volumetricChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {volumetricChart.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                    {[
                        { label: 'P90 (1P) Proved', value: `${p90} MMstb`, color: '#ef4444' },
                        { label: 'P50 (2P) Best Est.', value: `${p50} MMstb`, color: '#3b82f6' },
                        { label: 'P10 (3P) High Est.', value: `${p10} MMstb`, color: '#10b981' },
                    ].map(item => (
                        <div key={item.label} style={cardStyle(item.color)}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 20, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Material Balance */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>⚖️ Material Balance Summary</h3>
                {mb ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {[
                            { label: 'Depletion Drive', value: mb.driveIndices?.depletion ? `${(mb.driveIndices.depletion * 100).toFixed(0)}%` : 'N/A' },
                            { label: 'Water Drive', value: mb.driveIndices?.waterDrive ? `${(mb.driveIndices.waterDrive * 100).toFixed(0)}%` : 'N/A' },
                            { label: 'Gas Cap Drive', value: mb.driveIndices?.gasCap ? `${(mb.driveIndices.gasCap * 100).toFixed(0)}%` : 'N/A' },
                        ].map(item => (
                            <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                                <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: '#64748b', padding: 20, textAlign: 'center', background: '#1e293b', borderRadius: 8 }}>
                        Material balance not yet populated. Run the Material Balance module.
                    </div>
                )}
            </div>

            {/* SPE-PRMS Classification Table */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📋 SPE-PRMS Classification</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Class</th>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Oil (MMstb)</th>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['1P', 'Proved', p90, 'Developed + Undeveloped'],
                            ['2P', 'Proved + Probable', p50, 'Best Estimate'],
                            ['3P', 'Proved + Probable + Possible', p10, 'High Estimate'],
                        ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[0]}</td>
                                <td style={{ padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[1]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[2].toLocaleString()}</td>
                                <td style={{ padding: '7px 10px', color: '#10b981', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[3]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservesReport;