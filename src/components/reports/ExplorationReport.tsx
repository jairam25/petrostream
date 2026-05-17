/**
 * Change #8: Exploration Report Generator
 *
 * Basin analysis summary, petroleum system elements, prospect volumetrics,
 * COS breakdown, EMV calculation, well proposal — wired to shared state.
 *
 * Data model follows store/types.ts:
 *   Prospect.cos = { source, reservoir, seal, trap, migration, timing, pg }
 *   Prospect.stoiip = { p10, p50, p90 }
 *   Prospect.grv = { p10, p50, p90 }
 *   Prospect.location = { lat, lon }
 *   ExplorationWellPlan.afeCost, drillingDays, casingProgram, mudProgram
 */

import React, { useMemo } from 'react';
import { useExploration } from '../../store/hooks';
import { generateReport, type ReportDocument, type ReportSection } from '../../lib/export/pdfGenerator';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import DataTableExportWrapper from '../shared/DataTableExportWrapper';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const sectionStyle: React.CSSProperties = {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20,
};
const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
    borderBottom: '2px solid #334155', paddingBottom: 8,
};

const ExplorationReport: React.FC = () => {
    const { data: exploration } = useExploration();
    const prospect = exploration?.prospect;
    const wellPlan = exploration?.explorationWell;
    const basin = exploration?.basin;

    // Extract data with correct nested paths
    const cosSource = prospect?.cos?.source ?? 0.85;
    const cosReservoir = prospect?.cos?.reservoir ?? 0.70;
    const cosSeal = prospect?.cos?.seal ?? 0.75;
    const cosTrap = prospect?.cos?.trap ?? 0.65;
    const cosMigration = prospect?.cos?.migration ?? 0.80;
    const overallCos = (cosSource * cosReservoir * cosSeal * cosTrap * cosMigration * 100).toFixed(1);

    const stoiipP10 = prospect?.stoiip?.p10 ?? 520;
    const stoiipP50 = prospect?.stoiip?.p50 ?? 345;
    const stoiipP90 = prospect?.stoiip?.p90 ?? 180;
    const grvP50 = prospect?.grv?.p50 ?? 850;
    const emv = prospect?.emv ?? 42.5;
    const prospectName = prospect?.name ?? 'Prospect Alpha';
    const targetLat = prospect?.location?.lat ?? 31.5;
    const targetLon = prospect?.location?.lon ?? -103.2;
    const basinType = basin?.type ?? 'rift';
    const basinAge = basin?.ageRange ?? 'Jurassic-Cretaceous';
    const trapType = prospect?.trapType ?? 'structural_anticline';
    const afeCost = wellPlan?.afeCost ?? 18.5;
    const drillingDays = wellPlan?.drillingDays ?? 65;
    const casingProgram = wellPlan?.casingProgram ?? [];

    const cosBreakdown = useMemo(() => [
        { element: 'Source Rock', cos: cosSource * 100, fill: '#10b981' },
        { element: 'Reservoir', cos: cosReservoir * 100, fill: '#3b82f6' },
        { element: 'Seal', cos: cosSeal * 100, fill: '#8b5cf6' },
        { element: 'Trap', cos: cosTrap * 100, fill: '#f59e0b' },
        { element: 'Migration', cos: cosMigration * 100, fill: '#ec4899' },
    ], [cosSource, cosReservoir, cosSeal, cosTrap, cosMigration]);

    const basinLabel: Record<string, string> = {
        rift: 'Rift Basin',
        foreland: 'Foreland Basin',
        passive_margin: 'Passive Margin',
        intracratonic: 'Intracratonic Basin',
    };
    const trapLabel: Record<string, string> = {
        structural_anticline: 'Structural — Anticline',
        structural_fault: 'Structural — Fault',
        structural_salt_dome: 'Structural — Salt Dome',
        stratigraphic_pinchout: 'Stratigraphic — Pinchout',
        stratigraphic_unconformity: 'Stratigraphic — Unconformity',
        stratigraphic_reef: 'Stratigraphic — Reef',
        combination: 'Combination',
    };

    const handleGeneratePDF = async () => {
        const sections: ReportSection[] = [
            {
                heading: 'Basin Analysis Summary',
                paragraphs: [
                    `Basin Type: ${basinLabel[basinType] ?? basinType}`,
                    `Tectonic Setting: ${basinType === 'rift' ? 'Extensional' : basinType === 'foreland' ? 'Compressional' : 'Passive'}`,
                    `Depositional Environment: Fluvio-Deltaic / Shallow Marine`,
                    `Age Range: ${basinAge}`,
                    'This section summarizes the geological framework based on integrated seismic, well, and outcrop data.',
                ],
                tables: [{
                    caption: 'Petroleum System Elements',
                    header: ['Element', 'Description', 'Risk Factor'],
                    data: [
                        ['Source Rock', 'Organic-rich marine shale, TOC 3-6%, Type II kerogen', 'Low'],
                        ['Reservoir', 'Fluvio-deltaic sandstone, φ 15-22%, K 50-200 mD', 'Low-Moderate'],
                        ['Seal', 'Regional marine shale, 200-400 ft', 'Low'],
                        ['Trap', `${trapLabel[trapType] ?? trapType}`, 'Low'],
                        ['Migration', 'Vertical via growth faults, syn-rift source', 'Low-Moderate'],
                    ],
                }],
            },
            {
                heading: 'Prospect Volumetrics',
                paragraphs: [
                    `STOIIP — P10: ${stoiipP10} MMstb | P50: ${stoiipP50} MMstb | P90: ${stoiipP90} MMstb`,
                    `GRV (P50): ${grvP50} acre-ft | EMV: $${emv.toFixed(1)} MM`,
                ],
                tables: [{
                    caption: 'Volumetric Summary',
                    header: ['Metric', 'P10', 'P50', 'P90'],
                    data: [
                        ['STOIIP (MMstb)', stoiipP10.toString(), stoiipP50.toString(), stoiipP90.toString()],
                        ['GRV (acre-ft)', prospect?.grv?.p10?.toString() ?? '—', grvP50.toString(), prospect?.grv?.p90?.toString() ?? '—'],
                    ],
                }],
            },
            {
                heading: 'Chance of Success & Risk Assessment',
                paragraphs: [
                    `Overall COS: ${overallCos}%`,
                    `EMV: $${emv.toFixed(1)} MM`,
                    `Component COS — Source: ${(cosSource * 100).toFixed(0)}% | Reservoir: ${(cosReservoir * 100).toFixed(0)}% | Seal: ${(cosSeal * 100).toFixed(0)}% | Trap: ${(cosTrap * 100).toFixed(0)}% | Migration: ${(cosMigration * 100).toFixed(0)}%`,
                ],
            },
            {
                heading: 'Well Proposal',
                paragraphs: [
                    `Target: Lat ${targetLat}°, Lon ${targetLon}° — ${prospectName}`,
                    `Trajectory: Vertical well to TD ~12,500 ft MD`,
                    `Casing Program: ${casingProgram.length > 0 ? casingProgram.map((c: any) => `${c.casingSize}"@${c.shoeDepth}ft`).join(', ') : '20"@150ft, 13-3/8"@2500ft, 9-5/8"@8000ft, 7"@12500ft'}`,
                    `Mud Program: WBM 9.0-12.5 ppg, OBM for reservoir section`,
                    `Logging Program: Triple-combo + FMI + MDT + Fluid Sampling`,
                    `Estimated AFE: $${afeCost} MM | Duration: ${drillingDays} days`,
                ],
            },
            {
                heading: 'Recommendation',
                paragraphs: [
                    `Overall COS ${overallCos}% with EMV $${emv.toFixed(1)} MM → Recommendation: DRILL`,
                    'Risk mitigations: Acquire 3D seismic over fault closure; pre-drill pore pressure study; secure Q2 rig slot.',
                ],
            },
        ];

        const doc: ReportDocument = {
            config: {
                projectName: 'Exploration Portfolio',
                wellName: prospectName,
                reportTitle: 'Exploration Prospect Evaluation Report',
                reportType: 'Exploration Report',
                author: 'PetroStream User',
                classification: 'CONFIDENTIAL',
                accentColor: '#3b82f6',
            },
            executiveSummary: `${prospectName} is a ${trapLabel[trapType] ?? 'structural'} trap in a proven petroleum system. Volumetrics: STOIIP P50 = ${stoiipP50} MMstb. COS: ${overallCos}%. EMV: $${emv.toFixed(1)} MM supports drilling.`,
            sections,
        };

        const pdf = await generateReport(doc);
        pdf.save(`PetroStream_Exploration_${prospectName.replace(/\s+/g, '')}.pdf`);
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>🔍 Exploration Report</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                        Basin analysis • Volumetrics • COS • Well Proposal
                    </p>
                </div>
                <button
                    onClick={handleGeneratePDF}
                    style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700, background: '#3b82f6', color: '#fff',
                    }}
                >
                    📄 Generate PDF Report
                </button>
            </div>

            {/* Basin Analysis */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🌍 Basin Analysis Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Basin Type', value: basinLabel[basinType] ?? basinType },
                        { label: 'Age Range', value: basinAge },
                        { label: 'Trap Type', value: trapLabel[trapType] ?? trapType },
                    ].map((item) => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Element</th>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Description</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Source Rock', `Marine shale, TOC 3-6%, Type II — COS ${(cosSource * 100).toFixed(0)}%`, 'Low'],
                            ['Reservoir', `Fluvio-deltaic sandstone, φ 18%, K 50-200 mD — COS ${(cosReservoir * 100).toFixed(0)}%`, 'Low-Moderate'],
                            ['Seal', `Regional marine shale, 200-400 ft — COS ${(cosSeal * 100).toFixed(0)}%`, 'Low'],
                            ['Trap', `${trapLabel[trapType] ?? trapType} — COS ${(cosTrap * 100).toFixed(0)}%`, 'Low'],
                            ['Migration', `Vertical via growth faults — COS ${(cosMigration * 100).toFixed(0)}%`, 'Low-Moderate'],
                        ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[0]}</td>
                                <td style={{ padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>{row[1]}</td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: row[2] === 'Low' ? '#10b981' : '#f59e0b', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>{row[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* COS Breakdown */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🎯 Chance of Success Breakdown</h3>
                <ChartExportWrapper title="COS Breakdown" filename="PetroStream_COSBreakdown">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={cosBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                            <YAxis dataKey="element" type="category" stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="cos" radius={[0, 4, 4, 0]}>
                                {cosBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartExportWrapper>
                <div style={{ textAlign: 'center', marginTop: 8, color: '#10b981', fontSize: 18, fontWeight: 700 }}>
                    Overall COS: {overallCos}%
                </div>
            </div>

            {/* Volumetrics */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📐 Prospect Volumetrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'STOIIP P10', value: `${stoiipP10} MMstb`, color: '#10b981' },
                        { label: 'STOIIP P50', value: `${stoiipP50} MMstb`, color: '#3b82f6' },
                        { label: 'STOIIP P90', value: `${stoiipP90} MMstb`, color: '#ef4444' },
                    ].map((item) => (
                        <div key={item.label} style={{ background: '#1e293b', padding: 16, borderRadius: 8, textAlign: 'center', borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</div>
                        </div>
                    ))}
                </div>
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
                            ['GRV (P50)', grvP50.toString(), 'acre-ft'],
                            ['STOIIP P50', stoiipP50.toString(), 'MMstb'],
                            ['EMV', `$${emv.toFixed(1)}`, '$MM'],
                            ['Risky Volume', (prospect?.riskedVolume ?? (stoiipP50 * parseFloat(overallCos) / 100)).toFixed(0), 'MMstb'],
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

            {/* Economics */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>💰 Economic Assessment</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180, background: '#1e293b', padding: 18, borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #3b82f6' }}>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>EMV</div>
                        <div style={{ color: '#3b82f6', fontSize: 24, fontWeight: 700 }}>${emv.toFixed(1)} MM</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 180, background: '#1e293b', padding: 18, borderRadius: 8, textAlign: 'center', borderLeft: '3px solid #10b981' }}>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Recommendation</div>
                        <div style={{ color: '#10b981', fontSize: 18, fontWeight: 700 }}>DRILL ✓</div>
                    </div>
                </div>
            </div>

            {/* Well Proposal */}
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🏗️ Well Proposal</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Casing String</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Setting Depth (ft)</th>
                            <th style={{ textAlign: 'center', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #334155' }}>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(casingProgram.length > 0 ? casingProgram : [
                            { shoeDepth: 150, casingSize: 20, grade: 'X52', weight: 94 },
                            { shoeDepth: 2500, casingSize: 13.375, grade: 'L80', weight: 54.5 },
                            { shoeDepth: 8000, casingSize: 9.625, grade: 'L80', weight: 40 },
                            { shoeDepth: 12500, casingSize: 7, grade: 'L80', weight: 26 },
                        ]).map((c: any, i: number) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                <td style={{ padding: '7px 10px', color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #1e293b' }}>
                                    {i === 0 ? 'Conductor' : i === 1 ? 'Surface' : i === 2 ? 'Intermediate' : 'Production'}
                                </td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>
                                    {c.shoeDepth?.toLocaleString() ?? '—'} ft
                                </td>
                                <td style={{ textAlign: 'center', padding: '7px 10px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' }}>
                                    {c.casingSize ?? '—'}"
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: 14, background: '#1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 8 }}>Key Details</div>
                    <div>• Target: Lat {targetLat}°, Lon {targetLon}° — {prospectName}</div>
                    <div>• Mud Program: WBM 9.0-12.5 ppg, OBM for reservoir section</div>
                    <div>• Logging: Triple-combo + FMI + MDT + Fluid Sampling</div>
                    <div>• Estimated AFE: ${afeCost} MM | Duration: {drillingDays} days</div>
                </div>
            </div>
        </div>
    );
};

export default ExplorationReport;