/**
 * Change #8: Petrophysics Report Template
 *
 * Generates a professional CPi-style petrophysics report with:
 *   - Well information header
 *   - Log quality assessment
 *   - Input parameters summary
 *   - Zone-by-zone summary table
 *   - Core-log comparison crossplots
 *   - Pickett plot data
 *   - Porosity-permeability crossplot data
 *   - Net pay sensitivity analysis
 *   - Fluid contacts summary
 *   - Pay summary
 *
 * The report data is rendered as React components that can be:
 *   a) Viewed directly in the app (interactive preview)
 *   b) Exported to PDF via pdfGenerator
 *   c) Exported to Excel via excelExporter
 */

import React, { useMemo } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import ChartExportWrapper from '../shared/ChartExportWrapper';
import DataTableExportWrapper from '../shared/DataTableExportWrapper';

// ─── Types ───────────────────────────────────────────────────

export interface WellInfo {
    wellName: string;
    operator: string;
    field: string;
    spudDate: string;
    td: number;
    kbElevation: number;
    coordinates?: string;
}

export interface LogInventory {
    /** Log mnemonics acquired */
    logs: string[];
    /** Core intervals */
    coreIntervals: { top: number; base: number; type: string }[];
    /** Fluid sample depths */
    fluidSamples: { depth: number; type: string }[];
}

export interface PetrophysicsParams {
    rw: number;
    rwSource: string;
    rwTempCorrected: number;
    matrixDensity: number;
    fluidDensity: number;
    archieA: number;
    archieM: number;
    archieN: number;
    shaleParams: { vshMethod: string; vshCutoff: number };
    cutoffs: {
        vsh: number;
        porosity: number;
        sw: number;
        permeability: number;
    };
    temperature: number;
}

export interface ZoneSummary {
    zoneName: string;
    topDepth: number;
    baseDepth: number;
    grossThickness: number;
    netPay: number;
    ngRatio: number;
    avgPorosity: number;
    avgSw: number;
    avgPermeability: number;
    hpt: number;
}

export interface CoreLogComparison {
    corePorosity: number[];
    logPorosity: number[];
    corePermeability: number[];
    logPermeability: number[];
    r2Porosity: number;
    regEqPorosity: string;
    r2Permeability: number;
    regEqPermeability: string;
}

export interface PickettPlotData {
    logRt: number[];
    logPhi: number[];
    swLines: number[]; // Sw values for iso-saturation lines
}

export interface PorosityPermData {
    porosity: number[];
    permeability: number[];
    facies: string[]; // facies/zone label per point
}

export interface NetPaySensitivity {
    parameter: string;
    lowValue: number;
    baseValue: number;
    highValue: number;
    lowNetPay: number;
    highNetPay: number;
}

export interface FluidContact {
    contactName: string;
    depth: number;
    source: string;
    confidence: 'high' | 'medium' | 'low';
}

export interface PaySummary {
    totalNetPay: number;
    avgPorosity: number;
    avgSw: number;
    avgPermeability: number;
    stoipContribution?: number;
}

export interface PetrophysicsReportData {
    wellInfo: WellInfo;
    logInventory: LogInventory;
    logQualityNotes: string;
    params: PetrophysicsParams;
    zoneSummaries: ZoneSummary[];
    coreLogComparison: CoreLogComparison;
    pickettPlot: PickettPlotData;
    porosityPermData: PorosityPermData;
    netPaySensitivities: NetPaySensitivity[];
    fluidContacts: FluidContact[];
    paySummary: PaySummary;
}

// ─── Styles ───────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
    marginBottom: 24,
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: 20,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 16,
    borderBottom: '2px solid #334155',
    paddingBottom: 8,
};

const labelStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const valueStyle: React.CSSProperties = {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 500,
};

const gridRow: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
};

const chipStyle = (color: string): React.CSSProperties => ({
    background: color,
    color: '#fff',
    borderRadius: 12,
    padding: '2px 10px',
    fontSize: 11,
    fontWeight: 600,
    display: 'inline-block',
});

// ─── Sub-Components ──────────────────────────────────────────

const WellInfoHeader: React.FC<{ wellInfo: WellInfo }> = ({ wellInfo }) => (
    <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0 }}>
                Petrophysics Report
            </h2>
            <span style={chipStyle('#3b82f6')}>APPRAISAL STAGE</span>
        </div>
        <div style={gridRow}>
            <div>
                <div style={labelStyle}>Well Name</div>
                <div style={valueStyle}>{wellInfo.wellName || '—'}</div>
            </div>
            <div>
                <div style={labelStyle}>Operator</div>
                <div style={valueStyle}>{wellInfo.operator || '—'}</div>
            </div>
            <div>
                <div style={labelStyle}>Field</div>
                <div style={valueStyle}>{wellInfo.field || '—'}</div>
            </div>
            <div>
                <div style={labelStyle}>Spud Date</div>
                <div style={valueStyle}>{wellInfo.spudDate || '—'}</div>
            </div>
            <div>
                <div style={labelStyle}>TD (ft)</div>
                <div style={valueStyle}>{wellInfo.td?.toLocaleString() || '—'}</div>
            </div>
            <div>
                <div style={labelStyle}>KB Elevation (ft)</div>
                <div style={valueStyle}>{wellInfo.kbElevation?.toLocaleString() || '—'}</div>
            </div>
            {wellInfo.coordinates && (
                <div>
                    <div style={labelStyle}>Coordinates</div>
                    <div style={valueStyle}>{wellInfo.coordinates}</div>
                </div>
            )}
        </div>
    </div>
);

const DataInventory: React.FC<{ inventory: LogInventory; notes: string }> = ({ inventory, notes }) => (
    <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📋 Data Inventory & Quality</h3>
        <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>Logs Acquired</div>
            <div style={{ ...valueStyle, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {inventory.logs.map((log, i) => (
                    <span key={i} style={chipStyle('#334155')}>{log}</span>
                ))}
            </div>
        </div>
        {inventory.coreIntervals.length > 0 && (
            <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Core Intervals</div>
                <div style={{ marginTop: 4 }}>
                    {inventory.coreIntervals.map((ci, i) => (
                        <div key={i} style={{ color: '#cbd5e1', fontSize: 13 }}>
                            {ci.top}–{ci.base} ft — {ci.type}
                        </div>
                    ))}
                </div>
            </div>
        )}
        {inventory.fluidSamples.length > 0 && (
            <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Fluid Samples</div>
                <div style={{ marginTop: 4 }}>
                    {inventory.fluidSamples.map((fs, i) => (
                        <div key={i} style={{ color: '#cbd5e1', fontSize: 13 }}>
                            At {fs.depth} ft — {fs.type}
                        </div>
                    ))}
                </div>
            </div>
        )}
        <div>
            <div style={labelStyle}>Quality Assessment</div>
            <div style={{ ...valueStyle, marginTop: 4, fontSize: 13, color: '#cbd5e1' }}>
                {notes || 'No quality notes provided.'}
            </div>
        </div>
    </div>
);

const ParametersPanel: React.FC<{ params: PetrophysicsParams }> = ({ params }) => (
    <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>⚙️ Calculation Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            <ParamItem label="Rw (ohm·m)" value={params.rw.toFixed(3)} sub={params.rwSource} />
            <ParamItem label="Rw Temp Corrected" value={params.rwTempCorrected.toFixed(3)} sub="at formation temp" />
            <ParamItem label="Matrix Density" value={`${params.matrixDensity.toFixed(2)} g/cc`} />
            <ParamItem label="Fluid Density" value={`${params.fluidDensity.toFixed(2)} g/cc`} />
            <ParamItem label="Archie a" value={params.archieA.toFixed(3)} />
            <ParamItem label="Archie m" value={params.archieM.toFixed(3)} />
            <ParamItem label="Archie n" value={params.archieN.toFixed(3)} />
            <ParamItem label="Vsh Method" value={params.shaleParams.vshMethod} />
            <ParamItem label="Vsh Cutoff" value={params.shaleParams.vshCutoff.toFixed(2)} />
            <ParamItem label="Formation Temp" value={`${params.temperature} °F`} />
        </div>
        <div style={{ marginTop: 16, padding: 12, background: '#1e293b', borderRadius: 8 }}>
            <div style={labelStyle}>Cutoff Values</div>
            <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Vsh {'>'} {params.cutoffs.vsh}</span>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Porosity {'<'} {params.cutoffs.porosity}</span>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Sw {'>'} {params.cutoffs.sw}</span>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>K {'<'} {params.cutoffs.permeability} mD</span>
            </div>
        </div>
    </div>
);

const ParamItem: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <div style={{ padding: '8px 10px', background: '#1e293b', borderRadius: 6 }}>
        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ color: '#64748b', fontSize: 10, marginTop: 1 }}>{sub}</div>}
    </div>
);

const ZoneSummaryTable: React.FC<{ zones: ZoneSummary[] }> = ({ zones }) => {
    const columns = [
        { key: 'zoneName', label: 'Zone' },
        { key: 'topDepth', label: 'Top (ft)' },
        { key: 'baseDepth', label: 'Base (ft)' },
        { key: 'grossThickness', label: 'Gross (ft)' },
        { key: 'netPay', label: 'Net Pay (ft)' },
        { key: 'ngRatio', label: 'N/G' },
        { key: 'avgPorosity', label: 'Avg φ' },
        { key: 'avgSw', label: 'Avg Sw' },
        { key: 'avgPermeability', label: 'Avg K (mD)' },
        { key: 'hpt', label: 'HPT (ft)' },
    ];

    const data = zones.map((z) => ({
        zoneName: z.zoneName,
        topDepth: z.topDepth.toFixed(1),
        baseDepth: z.baseDepth.toFixed(1),
        grossThickness: z.grossThickness.toFixed(1),
        netPay: z.netPay.toFixed(1),
        ngRatio: z.ngRatio.toFixed(2),
        avgPorosity: (z.avgPorosity * 100).toFixed(1) + '%',
        avgSw: (z.avgSw * 100).toFixed(1) + '%',
        avgPermeability: z.avgPermeability < 10 ? z.avgPermeability.toFixed(2) : z.avgPermeability.toFixed(1),
        hpt: z.hpt.toFixed(2),
    }));

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>📊 Zone-by-Zone Summary</h3>
            <DataTableExportWrapper
                title="Zone_Summary"
                columns={columns}
                data={zones.map((z) => ({
                    zoneName: z.zoneName,
                    topDepth: z.topDepth,
                    baseDepth: z.baseDepth,
                    grossThickness: z.grossThickness,
                    netPay: z.netPay,
                    ngRatio: z.ngRatio,
                    avgPorosity: z.avgPorosity,
                    avgSw: z.avgSw,
                    avgPermeability: z.avgPermeability,
                    hpt: z.hpt,
                }))}
                filenamePrefix="PetroStream_Petrophysics_ZoneSummary"
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={thStyle}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                                {columns.map((col) => (
                                    <td key={col.key} style={tdStyle}>{row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataTableExportWrapper>
        </div>
    );
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '8px 10px',
    color: '#94a3b8',
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'uppercase',
    borderBottom: '2px solid #334155',
};

const tdStyle: React.CSSProperties = {
    padding: '7px 10px',
    color: '#e2e8f0',
    borderBottom: '1px solid #1e293b',
};

const CoreLogCrossplots: React.FC<{ data: CoreLogComparison }> = ({ data }) => {
    const porosityData = useMemo(
        () => data.corePorosity.map((cp, i) => ({ corePor: cp, logPor: data.logPorosity[i] || NaN })),
        [data]
    );

    const permData = useMemo(
        () => data.corePermeability.map((cp, i) => ({ corePerm: cp, logPerm: data.logPermeability[i] || NaN })),
        [data]
    );

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>🔬 Core-Log Comparison</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ChartExportWrapper title="Core-Log Porosity Crossplot" filename="PetroStream_CoreLog_Porosity">
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    type="number"
                                    dataKey="corePor"
                                    name="Core Porosity"
                                    unit=" (v/v)"
                                    stroke="#94a3b8"
                                    label={{ value: 'Core Porosity (v/v)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="logPor"
                                    name="Log Porosity"
                                    unit=" (v/v)"
                                    stroke="#94a3b8"
                                    label={{ value: 'Log Porosity (v/v)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <ReferenceLine y={0} stroke="#475569" />
                                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 0.4, y: 0.4 }]} stroke="#3b82f6" strokeDasharray="5 5" />
                                <Scatter data={porosityData} fill="#3b82f6" opacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                        R² = {data.r2Porosity.toFixed(4)} | {data.regEqPorosity}
                    </div>
                </ChartExportWrapper>

                <ChartExportWrapper title="Core-Log Permeability Crossplot" filename="PetroStream_CoreLog_Permeability">
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    type="number"
                                    dataKey="corePerm"
                                    name="Core K"
                                    unit=" (mD)"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    stroke="#94a3b8"
                                    label={{ value: 'Core Permeability (mD)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="logPerm"
                                    name="Log K"
                                    unit=" (mD)"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    stroke="#94a3b8"
                                    label={{ value: 'Log Permeability (mD)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                                />
                                <ReferenceLine segment={[{ x: 0.01, y: 0.01 }, { x: 10000, y: 10000 }]} stroke="#3b82f6" strokeDasharray="5 5" />
                                <Scatter data={permData} fill="#f59e0b" opacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                        R² = {data.r2Permeability.toFixed(4)} | {data.regEqPermeability}
                    </div>
                </ChartExportWrapper>
            </div>
        </div>
    );
};

const PorosityPermeabilityCrossplot: React.FC<{ data: PorosityPermData }> = ({ data }) => {
    const chartData = useMemo(
        () => data.porosity.map((phi, i) => ({ porosity: phi, permeability: data.permeability[i], facies: data.facies[i] || 'Unknown' })),
        [data]
    );

    // Color per facies
    const faciesColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
    const faciesList = [...new Set(data.facies)];

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>📈 Porosity–Permeability Crossplot</h3>
            <ChartExportWrapper title="Porosity-Permeability Crossplot" filename="PetroStream_PorosityPerm">
                <div style={{ height: 320 }}>
                    <ResponsiveContainer>
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                dataKey="porosity"
                                name="Porosity"
                                unit=" (v/v)"
                                domain={[0, 'auto']}
                                stroke="#94a3b8"
                                label={{ value: 'Porosity (v/v)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="permeability"
                                name="Permeability"
                                unit=" (mD)"
                                scale="log"
                                domain={['auto', 'auto']}
                                stroke="#94a3b8"
                                label={{ value: 'Permeability (mD)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                            />
                            <Legend />
                            {faciesList.map((facies, idx) => (
                                <Scatter
                                    key={facies}
                                    name={facies}
                                    data={chartData.filter((d) => d.facies === facies)}
                                    fill={faciesColors[idx % faciesColors.length]}
                                    opacity={0.7}
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </ChartExportWrapper>
        </div>
    );
};

const NetPaySensitivityChart: React.FC<{ data: NetPaySensitivity[] }> = ({ data }) => {
    const chartData = useMemo(
        () =>
            data.map((d) => ({
                parameter: d.parameter,
                low: d.lowNetPay,
                high: d.highNetPay,
                range: Math.abs(d.highNetPay - d.lowNetPay),
            })).sort((a, b) => b.range - a.range),
        [data]
    );

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>🎯 Net Pay Sensitivity Tornado</h3>
            <ChartExportWrapper title="Net Pay Sensitivity Tornado" filename="PetroStream_NetPaySensitivity">
                <div style={{ height: Math.max(200, chartData.length * 40) }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {chartData.map((d, i) => {
                            const lowPct = ((d.low - 10) / 50) * 100;
                            const highPct = ((d.high - 10) / 50) * 100;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 120, textAlign: 'right', color: '#94a3b8', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                                        {d.parameter}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{
                                            height: 18,
                                            width: `${Math.abs(lowPct)}%`,
                                            background: '#ef4444',
                                            borderRadius: '4px 0 0 4px',
                                            transition: 'width 0.3s',
                                            marginLeft: 'auto',
                                        }} />
                                        <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 700 }}>{d.low.toFixed(1)}</span>
                                        <span style={{ color: '#64748b', fontSize: 11 }}>← Low</span>
                                        <span style={{ color: '#475569', fontSize: 10, width: 30, textAlign: 'center' }}>vs</span>
                                        <span style={{ color: '#64748b', fontSize: 11 }}>High →</span>
                                        <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 700 }}>{d.high.toFixed(1)}</span>
                                        <div style={{
                                            height: 18,
                                            width: `${Math.abs(highPct)}%`,
                                            background: '#10b981',
                                            borderRadius: '0 4px 4px 0',
                                            transition: 'width 0.3s',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ChartExportWrapper>
        </div>
    );
};

const FluidContactsPanel: React.FC<{ contacts: FluidContact[] }> = ({ contacts }) => {
    const confidenceColor = (c: 'high' | 'medium' | 'low') => {
        switch (c) { case 'high': return '#10b981'; case 'medium': return '#f59e0b'; case 'low': return '#ef4444'; }
    };

    return (
        <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>💧 Fluid Contacts</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Contact</th>
                        <th style={thStyle}>Depth (ft)</th>
                        <th style={thStyle}>Source</th>
                        <th style={thStyle}>Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((c, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}>
                            <td style={tdStyle}>{c.contactName}</td>
                            <td style={tdStyle}>{c.depth.toLocaleString()}</td>
                            <td style={tdStyle}>{c.source}</td>
                            <td style={tdStyle}>
                                <span style={chipStyle(confidenceColor(c.confidence))}>{c.confidence.toUpperCase()}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PaySummaryPanel: React.FC<{ summary: PaySummary }> = ({ summary }) => (
    <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>💰 Pay Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <ParamItem label="Total Net Pay" value={`${summary.totalNetPay.toFixed(1)} ft`} />
            <ParamItem label="Average Porosity" value={`${(summary.avgPorosity * 100).toFixed(1)}%`} />
            <ParamItem label="Average Sw" value={`${(summary.avgSw * 100).toFixed(1)}%`} />
            <ParamItem label="Average Permeability" value={`${summary.avgPermeability.toFixed(1)} mD`} />
            {summary.stoipContribution !== undefined && (
                <ParamItem label="STOIIP Contribution" value={`${summary.stoipContribution.toLocaleString()} STB`} />
            )}
        </div>
    </div>
);

// ─── Main Report Component ───────────────────────────────────

export interface PetrophysicsReportProps {
    data: PetrophysicsReportData;
    /** Called with the summary data for external PDF/Excel generation */
    onGenerateReport?: () => void;
    onExportExcel?: () => void;
}

const PetrophysicsReport: React.FC<PetrophysicsReportProps> = ({ data }) => {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
            <WellInfoHeader wellInfo={data.wellInfo} />
            <DataInventory inventory={data.logInventory} notes={data.logQualityNotes} />
            <ParametersPanel params={data.params} />
            <ZoneSummaryTable zones={data.zoneSummaries} />
            {data.coreLogComparison.corePorosity.length > 0 && (
                <CoreLogCrossplots data={data.coreLogComparison} />
            )}
            {data.porosityPermData.porosity.length > 0 && (
                <PorosityPermeabilityCrossplot data={data.porosityPermData} />
            )}
            {data.netPaySensitivities.length > 0 && (
                <NetPaySensitivityChart data={data.netPaySensitivities} />
            )}
            {data.fluidContacts.length > 0 && (
                <FluidContactsPanel contacts={data.fluidContacts} />
            )}
            <PaySummaryPanel summary={data.paySummary} />
        </div>
    );
};

export default PetrophysicsReport;