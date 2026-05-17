/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Sub-Step 5.1: Transportation Mode Selection & Route Planning
 */

import React, { useState, useMemo } from 'react';
import {
    TANKER_CLASSES,
    DEFAULT_TRANSPORT_MODES,
    CHOKEPOINT_RISKS,
    TransportMode,
    compareTransportModes,
    estimatePermittingTimeline,
    calculateTransportNPV,
} from '../../lib/midstream';

type TabId = 'modes' | 'route' | 'permitting' | 'npv';

const TransportationModeSelection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('modes');
    const [distanceKm, setDistanceKm] = useState<number>(800);
    const [volumeBpd, setVolumeBpd] = useState<number>(100000);
    const [discountRate, setDiscountRate] = useState<number>(0.10);
    const [fieldLife, setFieldLife] = useState<number>(20);
    const [jurisdictionCount, setJurisdictionCount] = useState<number>(3);
    const [envSensitivity, setEnvSensitivity] = useState<number>(0.4);
    const [indigenousConsult, setIndigenousConsult] = useState<boolean>(true);
    const [crossBorder, setCrossBorder] = useState<boolean>(false);
    const [selectedCanal, setSelectedCanal] = useState<string>('none');

    const modeComparison = useMemo(
        () => compareTransportModes(DEFAULT_TRANSPORT_MODES, distanceKm, volumeBpd, fieldLife),
        [distanceKm, volumeBpd, fieldLife],
    );

    const permitting = useMemo(
        () => estimatePermittingTimeline(jurisdictionCount, envSensitivity, indigenousConsult, crossBorder),
        [jurisdictionCount, envSensitivity, indigenousConsult, crossBorder],
    );

    const npvResults = useMemo(
        () =>
            modeComparison
                .filter((m) => m.feasible)
                .map((m) => ({
                    name: m.name,
                    ...calculateTransportNPV(m.capex, m.annualOpex, discountRate, fieldLife),
                })),
        [modeComparison, discountRate, fieldLife],
    );

    const tankerClasses = Object.entries(TANKER_CLASSES);

    return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#e2e8f0' }}>
                ⛴ Transportation Mode Selection & Route Planning
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
                Compare pipeline, tanker, rail, truck, and barge options — factoring CAPEX, OPEX, permitting, and chokepoint risk.
            </p>

            {/* Global Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <InputField label="Distance (km)" value={distanceKm} onChange={setDistanceKm} min={10} max={25000} />
                <InputField label="Volume (bpd)" value={volumeBpd} onChange={setVolumeBpd} min={1000} max={1000000} step={1000} />
                <InputField label="Discount Rate (%)" value={discountRate * 100} onChange={(v) => setDiscountRate(v / 100)} min={0} max={30} step={0.5} />
                <InputField label="Field Life (yr)" value={fieldLife} onChange={setFieldLife} min={5} max={50} />
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid #334155' }}>
                {(
                    [
                        ['modes', 'Mode Comparison'],
                        ['route', 'Route & Chokepoint Risk'],
                        ['permitting', 'Permitting Timeline'],
                        ['npv', 'NPV Analysis'],
                    ] as [TabId, string][]
                ).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === id ? '#1e293b' : 'transparent',
                            color: activeTab === id ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            borderBottom: activeTab === id ? '2px solid #38bdf8' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ----- MODE COMPARISON TABLE ----- */}
            {activeTab === 'modes' && (
                <div>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mode</th>
                                <th style={thStyle}>CAPEX ($M)</th>
                                <th style={thStyle}>Annual OPEX ($M)</th>
                                <th style={thStyle}>Lifecycle Cost ($M)</th>
                                <th style={thStyle}>Cost/bbl ($)</th>
                                <th style={thStyle}>Feasible</th>
                                <th style={thStyle}>Constraint</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modeComparison.map((m, i) => (
                                <tr key={i} style={{ background: m.feasible ? 'transparent' : 'rgba(239,68,68,0.08)' }}>
                                    <td style={tdStyle}>{m.name}</td>
                                    <td style={tdStyle}>{(m.capex / 1e6).toFixed(1)}</td>
                                    <td style={tdStyle}>{(m.annualOpex / 1e6).toFixed(1)}</td>
                                    <td style={tdStyle}>{(m.totalLifecycleCost / 1e6).toFixed(1)}</td>
                                    <td style={tdStyle}>{m.costPerBarrel.toFixed(2)}</td>
                                    <td style={tdStyle}>{m.feasible ? '✅' : '️'}</td>
                                    <td style={{ ...tdStyle, color: m.feasible ? '#4ade80' : '#f87171', fontSize: 11 }}>
                                        {m.constraintReason || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Tanker Class Reference */}
                    <h3 style={{ color: '#e2e8f0', fontSize: 15, marginTop: 24, marginBottom: 8 }}>Tanker Vessel Classes</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {tankerClasses.map(([key, cls]) => (
                            <div key={key} style={{ background: '#1e293b', borderRadius: 8, padding: 12, border: '1px solid #334155' }}>
                                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: 13 }}>{key}</div>
                                <div style={{ color: '#cbd5e1', fontSize: 12 }}>{cls.description}</div>
                                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
                                    DWT: {cls.minDwt.toLocaleString()}–{cls.maxDwt.toLocaleString()} | Capacity: {cls.barrels.toLocaleString()} bbl | Draft: {cls.draftFt} ft
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ----- ROUTE & CHOKEPOINT RISK ----- */}
            {activeTab === 'route' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                        <InputField label="Jurisdictions" value={jurisdictionCount} onChange={setJurisdictionCount} min={1} max={20} />
                        <InputField label="Env. Sensitivity (0-1)" value={envSensitivity} onChange={setEnvSensitivity} min={0} max={1} step={0.05} />
                        <label style={{ color: '#e2e8f0', fontSize: 13 }}>
                            <input type="checkbox" checked={indigenousConsult} onChange={(e) => setIndigenousConsult(e.target.checked)} /> Indigenous Consultation
                        </label>
                        <label style={{ color: '#e2e8f0', fontSize: 13 }}>
                            <input type="checkbox" checked={crossBorder} onChange={(e) => setCrossBorder(e.target.checked)} /> Cross-Border
                        </label>
                    </div>

                    <label style={labelStyle}>
                        Chokepoint / Canal
                        <select value={selectedCanal} onChange={(e) => setSelectedCanal(e.target.value)} style={selectStyle}>
                            <option value="none">None</option>
                            <option value="suez">Suez Canal</option>
                            <option value="panama">Panama Canal</option>
                            <option value="hormuz">Strait of Hormuz</option>
                            <option value="malacca">Strait of Malacca</option>
                            <option value="bab">Bab el-Mandeb</option>
                            <option value="turkish">Turkish Straits</option>
                        </select>
                    </label>

                    {selectedCanal !== 'none' && CHOKEPOINT_RISKS[selectedCanal] && (
                        <div style={{ marginTop: 12, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: 14 }}>
                            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14 }}>⚠️ Chokepoint Risk Assessment</div>
                            <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>{CHOKEPOINT_RISKS[selectedCanal].description}</div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 12 }}>
                                <span style={{ color: '#f87171' }}>Delay: {CHOKEPOINT_RISKS[selectedCanal].delayDays} days</span>
                                <span style={{ color: '#f87171' }}>Cost Surcharge: {(CHOKEPOINT_RISKS[selectedCanal].costSurcharge * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    )}

                    {/* Chokepoint Reference Grid */}
                    <h3 style={{ color: '#e2e8f0', fontSize: 15, marginTop: 20, marginBottom: 8 }}>All Chokepoint Risk Data</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {Object.entries(CHOKEPOINT_RISKS).map(([k, v]) => (
                            <div key={k} style={{ background: '#1e293b', borderRadius: 6, padding: 10 }}>
                                <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>{k}</span>
                                <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 8 }}>Delay: {v.delayDays}d | Surcharge: {(v.costSurcharge * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ----- PERMITTING TIMELINE ----- */}
            {activeTab === 'permitting' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                        <MetricCard label="Expected Duration" value={`${permitting.expectedMonths.toFixed(0)} months`} sub={`Range: ${permitting.minMonths.toFixed(0)}–${permitting.maxMonths.toFixed(0)} months`} />
                        <MetricCard label="Minimum" value={`${permitting.minMonths.toFixed(0)} mo`} />
                        <MetricCard label="Maximum" value={`${permitting.maxMonths.toFixed(0)} mo`} />
                    </div>
                    <h3 style={{ color: '#e2e8f0', fontSize: 15, marginBottom: 8 }}>Key Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {permitting.keyMilestones.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#1e293b', borderRadius: 6 }}>
                                <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 13 }}>{i + 1}.</span>
                                <span style={{ color: '#cbd5e1', fontSize: 13 }}>{m}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ----- NPV ANALYSIS ----- */}
            {activeTab === 'npv' && (
                <div>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mode</th>
                                <th style={thStyle}>NPV ($M)</th>
                                <th style={thStyle}>Undiscounted Total ($M)</th>
                                <th style={thStyle}>Annualized Cost ($M/yr)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {npvResults.map((r, i) => (
                                <tr key={i}>
                                    <td style={tdStyle}>{r.name}</td>
                                    <td style={tdStyle}>{(r.npv / 1e6).toFixed(2)}</td>
                                    <td style={tdStyle}>{(r.undiscountedTotal / 1e6).toFixed(2)}</td>
                                    <td style={tdStyle}>{(r.annualizedCost / 1e6).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ---- Sub-components ----

const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
}> = ({ label, value, onChange, min, max, step = 1 }) => (
    <label style={labelStyle}>
        {label}
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            style={inputStyle}
        />
    </label>
);

const MetricCard: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: 16, border: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#38bdf8', fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
        {sub && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
);

// ---- Inline Styles ----
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, color: '#e2e8f0', fontSize: 12, fontWeight: 500 };
const inputStyle: React.CSSProperties = { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', fontSize: 13 };
const selectStyle: React.CSSProperties = { ...inputStyle, width: '100%', marginTop: 4 };

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #334155', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #1e293b', color: '#e2e8f0' };

export default TransportationModeSelection;