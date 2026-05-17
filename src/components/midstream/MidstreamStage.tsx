/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Phase 5: Midstream Transportation — Full Stage Component
 *
 * Sub-tabs:
 *   5.1 Transportation Mode Selection & Route Planning (existing)
 *   5.2 Pipeline Design & Engineering
 *   5.3 Pipeline Construction & Cost Estimation
 *   5.4 Storage Terminals & Tank Farms
 *   5.5 Pipeline Integrity Management
 *   5.6 Pump & Compressor Stations
 *   5.7 Marine Transport & Shipping
 *   5.8 SCADA, Leak Detection & Automation
 *   5.9 Midstream Economics & Tariff Design
 *   5.10 HSE & Regulatory (Midstream)
 */

import React, { useState, useMemo, useEffect } from 'react';
import TransportationModeSelection from './TransportationModeSelection';
import { useProduction, useMidstream } from '../../store/hooks';
import {
    PIPE_GRADES,
    LOCATION_CLASS_FACTORS,
    COATING_TYPES,
    JOINT_FACTORS,
    darcyWeisbachDP,
    colebrookWhite,
    reynoldsNumber,
    barlowsWallThickness,
    erosionalVelocity,
    optimalPipeDiameter,
    pumpStationSpacing,
    compressorPowerRequired,
    draThroughputBoost,
    pipelineTemperatureProfile,
    estimateConstructionDuration,
    estimateConstructionCost,
    TERRAIN_FACTORS,
    TANK_TYPES,
    api650ShellThickness,
    bundWallVolume,
    fireFoamRequirement,
    calculateBreathingLoss,
    calculateWorkingLoss,
    asmeB31G,
    modifiedB31G,
    hydrotestPressure,
    weymouthFlow,
    panhandleAFlow,
    compressibilityFactor,
    corrosionGrowthRate,
    calculateTransportNPV,
    estimatePermittingTimeline,
    compareTransportModes,
    DEFAULT_TRANSPORT_MODES,
} from '../../lib/midstream';

// ─── Tab type ───
type MidstreamTabId =
    | 'transport'
    | 'pipeline-design'
    | 'construction'
    | 'storage'
    | 'integrity'
    | 'pump-compressor'
    | 'marine'
    | 'scada'
    | 'economics'
    | 'hse';

// ─── Reusable form input ───
const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
}> = ({ label, value, onChange, min, max, step, suffix }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                min={min}
                max={max}
                step={step ?? 0.1}
                style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 4,
                    fontSize: 13,
                }}
            />
            {suffix && <span style={{ marginLeft: 6, color: '#64748b', fontSize: 12 }}>{suffix}</span>}
        </div>
    </div>
);

const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                padding: '6px 8px',
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: 4,
                fontSize: 13,
            }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

const MetricCard: React.FC<{ label: string; value: string | number; unit?: string; highlight?: boolean }> = ({
    label,
    value,
    unit,
    highlight,
}) => (
    <div
        style={{
            padding: '12px 16px',
            background: highlight ? '#1e3a5f' : '#1e293b',
            borderRadius: 8,
            border: highlight ? '1px solid #38bdf8' : '1px solid #334155',
            textAlign: 'center',
        }}
    >
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: highlight ? '#38bdf8' : '#e2e8f0' }}>
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
        </div>
        {unit && <div style={{ fontSize: 11, color: '#64748b' }}>{unit}</div>}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// SUB-TABS
// ═══════════════════════════════════════════════════════════════

// 5.2 Pipeline Design & Engineering
const PipelineDesignTab: React.FC = () => {
    const [grade, setGrade] = useState('X52');
    const [locClass, setLocClass] = useState('1');
    const [jointType, setJointType] = useState('seamless');
    const [od, setOd] = useState(24);
    const [designPressure, setDesignPressure] = useState(1440);
    const [tempDerating, setTempDerating] = useState(1.0);
    const [flowRateBpd, setFlowRateBpd] = useState(100000);
    const [viscosityCP, setViscosityCP] = useState(5);
    const [terrain, setTerrain] = useState('flat');
    const [frictionFactorInput, setFrictionFactorInput] = useState(0.015);
    const [densityLbFt3, setDensityLbFt3] = useState(54);
    const [velocityFtS, setVelocityFtS] = useState(6);

    const gradeData = PIPE_GRADES[grade];
    const locData = LOCATION_CLASS_FACTORS[parseInt(locClass)];
    const jointFactorVal = JOINT_FACTORS[jointType];

    const wall = useMemo(
        () => barlowsWallThickness(designPressure, od, gradeData.smysPsi, jointFactorVal, locData.designFactor, tempDerating),
        [designPressure, od, gradeData, jointFactorVal, locData, tempDerating],
    );

    const dp = useMemo(
        () => darcyWeisbachDP(frictionFactorInput, 5280, od, densityLbFt3, velocityFtS),
        [frictionFactorInput, od, densityLbFt3, velocityFtS],
    );

    const optimalD = useMemo(() => optimalPipeDiameter(flowRateBpd, viscosityCP, TERRAIN_FACTORS[terrain] || 1.0), [flowRateBpd, viscosityCP, terrain]);

    const eVelocity = useMemo(() => erosionalVelocity(100, densityLbFt3), [densityLbFt3]);

    const spacing = useMemo(() => pumpStationSpacing(1440, 50, dp * (1 / 5.28), 0, 7.2), [dp]);

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>🔧 Pipeline Design & Engineering</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <SelectField label="Pipe Grade (API 5L)" value={grade} onChange={setGrade} options={Object.keys(PIPE_GRADES).map((k) => ({ value: k, label: `${k} — ${PIPE_GRADES[k].description}` }))} />
                <SelectField label="Location Class" value={locClass} onChange={setLocClass} options={Object.entries(LOCATION_CLASS_FACTORS).map(([k, v]) => ({ value: k, label: `Class ${k}: ${v.description}` }))} />
                <SelectField label="Joint Type" value={jointType} onChange={setJointType} options={Object.entries(JOINT_FACTORS).map(([k, v]) => ({ value: k, label: `${k.toUpperCase()} (E=${v})` }))} />
                <InputField label="Outside Diameter" value={od} onChange={setOd} min={4} max={80} suffix="in" />
                <InputField label="Design Pressure" value={designPressure} onChange={setDesignPressure} min={100} max={3000} suffix="psi" />
                <InputField label="Temp Derating Factor" value={tempDerating} onChange={setTempDerating} min={0.5} max={1.0} step={0.05} />
                <InputField label="Flow Rate" value={flowRateBpd} onChange={setFlowRateBpd} min={1000} max={500000} step={1000} suffix="bpd" />
                <InputField label="Viscosity" value={viscosityCP} onChange={setViscosityCP} min={0.5} max={500} suffix="cP" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Required Wall Thickness" value={wall.thicknessIn.toFixed(4)} unit="in" highlight />
                <MetricCard label="Wall (mm)" value={wall.thicknessMm.toFixed(2)} unit="mm" />
                <MetricCard label="MAOP" value={wall.maopPsi.toFixed(0)} unit="psi" />
                <MetricCard label="SMYS" value={gradeData.smysPsi.toLocaleString()} unit="psi" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Optimal Econ Diameter" value={optimalD.toFixed(1)} unit="in" />
                <MetricCard label="Erosional Velocity" value={eVelocity.toFixed(1)} unit="ft/s" />
                <MetricCard label="ΔP per Mile" value={dp.toFixed(2)} unit="psi" />
                <MetricCard label="Max Station Spacing" value={spacing.toFixed(0)} unit="km" />
            </div>

            <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                    Barlow's Formula: <code style={{ color: '#38bdf8' }}>t = (P × D) / (2 × S × E × F × T)</code>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                    Grade {grade}: SMYS = {gradeData.smysPsi.toLocaleString()} psi ({gradeData.smysMpa} MPa) · Design Factor (F) = {locData.designFactor} · Joint Factor (E) = {jointFactorVal}
                </div>
            </div>
        </div>
    );
};

// 5.3 Pipeline Construction & Cost
const ConstructionTab: React.FC = () => {
    const [lengthKm, setLengthKm] = useState(200);
    const [diameterIn, setDiameterIn] = useState(24);
    const [terrainType, setTerrainType] = useState('flat');
    const [coating, setCoating] = useState('ThreeLPE');
    const [laborCost, setLaborCost] = useState(75000);
    const [materialCost, setMaterialCost] = useState(1200);
    const [riverCrossings, setRiverCrossings] = useState(3);
    const [roadCrossings, setRoadCrossings] = useState(8);
    const [hddCrossings, setHddCrossings] = useState(1);
    const [spreadCount, setSpreadCount] = useState(1);
    const [maop, setMaop] = useState(1440);

    const duration = useMemo(
        () => estimateConstructionDuration(lengthKm, diameterIn, terrainType, riverCrossings, roadCrossings, hddCrossings, spreadCount),
        [lengthKm, diameterIn, terrainType, riverCrossings, roadCrossings, hddCrossings, spreadCount],
    );

    const cost = useMemo(
        () => estimateConstructionCost(lengthKm, diameterIn, terrainType, coating, laborCost, materialCost, roadCrossings + riverCrossings + hddCrossings),
        [lengthKm, diameterIn, terrainType, coating, laborCost, materialCost, roadCrossings, riverCrossings, hddCrossings],
    );

    const hydro = useMemo(() => hydrotestPressure(maop, 'liquid'), [maop]);

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>🚧 Pipeline Construction & Cost Estimation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <InputField label="Pipeline Length" value={lengthKm} onChange={setLengthKm} min={10} max={5000} suffix="km" />
                <InputField label="Diameter" value={diameterIn} onChange={setDiameterIn} min={4} max={60} suffix="in" />
                <SelectField label="Terrain" value={terrainType} onChange={setTerrainType} options={Object.keys(TERRAIN_FACTORS).map((k) => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))} />
                <SelectField label="Coating" value={coating} onChange={setCoating} options={Object.keys(COATING_TYPES).map((k) => ({ value: k, label: COATING_TYPES[k].name }))} />
                <InputField label="Labor/Day/Spread" value={laborCost} onChange={setLaborCost} min={10000} max={500000} step={1000} suffix="$" />
                <InputField label="Material/Ton" value={materialCost} onChange={setMaterialCost} min={500} max={5000} suffix="$" />
                <InputField label="River Crossings" value={riverCrossings} onChange={setRiverCrossings} min={0} max={50} step={1} />
                <InputField label="HDD Crossings" value={hddCrossings} onChange={setHddCrossings} min={0} max={20} step={1} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Total Duration" value={Math.round(duration.totalDays)} unit="days" highlight />
                <MetricCard label="Production Rate" value={duration.productionRateKmPerDay.toFixed(2)} unit="km/day" />
                <MetricCard label="Total Cost" value={`$${(cost.totalCost / 1e6).toFixed(2)}M`} highlight />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Cost/km" value={`$${(cost.costPerKm / 1e6).toFixed(2)}M`} />
                <MetricCard label="Hydrotest Pressure" value={hydro.testPressurePsi.toFixed(0)} unit="psi" />
                <MetricCard label="Hold Time" value={hydro.holdTimeHours} unit="hrs" />
            </div>

            <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Construction Phases</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#64748b' }}>Phase</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>Days</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {duration.phaseDurations.map((p) => (
                            <tr key={p.phase} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '4px 8px', color: '#e2e8f0' }}>{p.phase}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#e2e8f0' }}>{Math.round(p.days)}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>{((p.days / duration.totalDays) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Cost Breakdown</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#64748b' }}>Item</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>Cost ($)</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cost.breakdown.map((b) => (
                            <tr key={b.item} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '4px 8px', color: '#e2e8f0' }}>{b.item}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#e2e8f0' }}>${(b.cost / 1e6).toFixed(2)}M</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>{((b.cost / cost.totalCost) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 5.4 Storage Terminals
const StorageTab: React.FC = () => {
    const [tankType, setTankType] = useState('externalFloat');
    const [diameterFt, setDiameterFt] = useState(150);
    const [heightFt, setHeightFt] = useState(48);
    const [sg, setSg] = useState(0.85);
    const [stress, setStress] = useState(23200);
    const [jointEff, setJointEff] = useState(0.85);
    const [ca, setCa] = useState(0.0625);
    const [annualThroughput, setAnnualThroughput] = useState(5000000);
    const [vaporPressure, setVaporPressure] = useState(8);
    const [ambientTemp, setAmbientTemp] = useState(530);
    const [tempRange, setTempRange] = useState(25);

    const tankData = TANK_TYPES[tankType];
    const tankVolBbl = useMemo(() => Math.PI * Math.pow(diameterFt / 2, 2) * heightFt * 5.615 / 42, [diameterFt, heightFt]);
    const courses = useMemo(() => api650ShellThickness(diameterFt, heightFt, sg, stress, jointEff, ca), [diameterFt, heightFt, sg, stress, jointEff, ca]);
    const bund = useMemo(() => bundWallVolume(tankVolBbl), [tankVolBbl]);
    const foam = useMemo(() => fireFoamRequirement(diameterFt, 0.16, 20, 3), [diameterFt]);
    const breathing = useMemo(
        () => calculateBreathingLoss(diameterFt, vaporPressure, ambientTemp, tempRange, 0.5, tankType === 'fixedCone' || tankType === 'fixedDome' ? 'fixed' : tankType === 'externalFloat' ? 'externalFloat' : 'internalFloat'),
        [diameterFt, vaporPressure, ambientTemp, tempRange, tankType],
    );
    const working = useMemo(() => calculateWorkingLoss(annualThroughput, 65, vaporPressure, 24), [annualThroughput, vaporPressure]);

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>🏗️ Storage Terminals & Tank Farms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <SelectField label="Tank Type" value={tankType} onChange={setTankType} options={Object.entries(TANK_TYPES).map(([k, v]) => ({ value: k, label: v.name }))} />
                <InputField label="Diameter" value={diameterFt} onChange={setDiameterFt} min={20} max={300} suffix="ft" />
                <InputField label="Height" value={heightFt} onChange={setHeightFt} min={16} max={64} suffix="ft" />
                <InputField label="Specific Gravity" value={sg} onChange={setSg} min={0.5} max={1.5} step={0.01} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Tank Volume" value={tankVolBbl.toLocaleString()} unit="bbl" highlight />
                <MetricCard label="Bund Wall Volume" value={bund.requiredVolumeBbl.toLocaleString()} unit="bbl" />
                <MetricCard label="Fire Foam Concentrate" value={foam.foamConcentrateGal.toFixed(0)} unit="gal" />
                <MetricCard label="Tank Cost" value={`$${((tankData?.costPerBarrel || 20) * tankVolBbl / 1e6).toFixed(2)}M`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Breathing Loss" value={breathing.toFixed(1)} unit="bbl/yr" />
                <MetricCard label="Working Loss" value={working.toFixed(1)} unit="bbl/yr" />
                <MetricCard label="Total VOC Loss" value={(breathing + working).toFixed(1)} unit="bbl/yr" />
            </div>

            <div style={{ marginTop: 16 }}>
                <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>API 650 Shell Courses (1-Foot Method)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#64748b' }}>Course</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>Bottom (ft)</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>Top (ft)</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#64748b' }}>Thickness (in)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '4px 8px', color: '#e2e8f0' }}>Course {i + 1}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#e2e8f0' }}>{c.bottomFt}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#e2e8f0' }}>{c.topFt}</td>
                                <td style={{ textAlign: 'right', padding: '4px 8px', color: '#38bdf8' }}>{c.thicknessIn.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 5.5 Pipeline Integrity
const IntegrityTab: React.FC = () => {
    const [grade, setGrade] = useState('X52');
    const [od, setOd] = useState(24);
    const [wt, setWt] = useState(0.375);
    const [corrDepth, setCorrDepth] = useState(0.12);
    const [corrLength, setCorrLength] = useState(6);
    const [maopVal, setMaopVal] = useState(1440);
    const [prevDepthsStr, setPrevDepthsStr] = useState('0.05,0.06,0.07,0.09,0.10');
    const [newDepthsStr, setNewDepthsStr] = useState('0.06,0.07,0.08,0.11,0.12');
    const [yearsBetween, setYearsBetween] = useState(5);

    const gradeData = PIPE_GRADES[grade];
    const b31gResult = useMemo(() => asmeB31G(gradeData.smysPsi, od, wt, corrDepth, corrLength), [gradeData, od, wt, corrDepth, corrLength]);

    const prevDepths = useMemo(() => prevDepthsStr.split(',').map(Number).filter((n) => !isNaN(n)), [prevDepthsStr]);
    const newDepths = useMemo(() => newDepthsStr.split(',').map(Number).filter((n) => !isNaN(n)), [newDepthsStr]);
    const growthRate = useMemo(() => corrosionGrowthRate(prevDepths, newDepths, yearsBetween), [prevDepths, newDepths, yearsBetween]);

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>🛡️ Pipeline Integrity Management (ASME B31G)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <SelectField label="Grade" value={grade} onChange={setGrade} options={Object.keys(PIPE_GRADES).map((k) => ({ value: k, label: k }))} />
                <InputField label="OD" value={od} onChange={setOd} min={4} max={60} suffix="in" />
                <InputField label="Wall Thickness" value={wt} onChange={setWt} min={0.1} max={2} step={0.001} suffix="in" />
                <InputField label="MAOP" value={maopVal} onChange={setMaopVal} min={100} max={3000} suffix="psi" />
                <InputField label="Corrosion Depth" value={corrDepth} onChange={setCorrDepth} min={0.01} max={2} step={0.001} suffix="in" />
                <InputField label="Corrosion Length" value={corrLength} onChange={setCorrLength} min={1} max={100} suffix="in" />
                <InputField label="Years Between ILI" value={yearsBetween} onChange={setYearsBetween} min={1} max={20} suffix="yr" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Safe Pressure (72% DF)" value={b31gResult.safePressurePsi.toFixed(0)} unit="psi" highlight />
                <MetricCard label="Failure Pressure" value={b31gResult.failurePressurePsi.toFixed(0)} unit="psi" />
                <MetricCard label="ER Factor" value={b31gResult.erFactor.toFixed(3)} />
                <MetricCard label="Repair Required" value={b31gResult.repairRequired ? '⚠️ YES' : '✅ NO'} highlight={b31gResult.repairRequired} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Corrosion Growth Rate" value={growthRate.averageGrowthRateInchPerYr.toFixed(4)} unit="in/yr" />
                <MetricCard label="Max Growth Rate" value={growthRate.maxGrowthRateInchPerYr.toFixed(4)} unit="in/yr" />
                <MetricCard label="Years to Critical" value={growthRate.remainingLifeYears.toFixed(1)} unit="yr" />
            </div>

            <div style={{ padding: 12, background: b31gResult.repairRequired ? '#450a0a' : '#0f172a', borderRadius: 8, border: `1px solid ${b31gResult.repairRequired ? '#dc2626' : '#334155'}` }}>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {b31gResult.repairRequired
                        ? '⚠️ Immediate repair required — safe pressure below MAOP. Schedule intervention.'
                        : '✅ Asset operates safely at MAOP. Monitor per integrity management plan.'}
                </div>
            </div>
        </div>
    );
};

// 5.6 Pump & Compressor Stations
const PumpCompressorTab: React.FC = () => {
    const [flowMMscfd, setFlowMMscfd] = useState(300);
    const [suctionPsia, setSuctionPsia] = useState(800);
    const [dischargePsia, setDischargePsia] = useState(1400);
    const [suctionTempR, setSuctionTempR] = useState(540);
    const [zFactor, setZFactor] = useState(0.85);
    const [kRatio, setKRatio] = useState(1.3);
    const [efficiency, setEfficiency] = useState(0.82);
    const [draPpm, setDraPpm] = useState(0);
    const [baseFriction, setBaseFriction] = useState(0.015);

    const hp = useMemo(
        () => compressorPowerRequired(flowMMscfd, suctionPsia, dischargePsia, suctionTempR, zFactor, kRatio, efficiency),
        [flowMMscfd, suctionPsia, dischargePsia, suctionTempR, zFactor, kRatio, efficiency],
    );

    const draEffect = useMemo(() => draThroughputBoost(draPpm, baseFriction), [draPpm, baseFriction]);

    const pratio = dischargePsia / suctionPsia;

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>⚡ Pump & Compressor Stations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <InputField label="Flow" value={flowMMscfd} onChange={setFlowMMscfd} min={10} max={2000} suffix="MMSCFD" />
                <InputField label="Suction Pressure" value={suctionPsia} onChange={setSuctionPsia} min={100} max={2000} suffix="psia" />
                <InputField label="Discharge Pressure" value={dischargePsia} onChange={setDischargePsia} min={200} max={3000} suffix="psia" />
                <InputField label="Suction Temp" value={suctionTempR} onChange={setSuctionTempR} min={400} max={700} suffix="°R" />
                <InputField label="Compressibility Z" value={zFactor} onChange={setZFactor} min={0.5} max={1.2} step={0.01} />
                <InputField label="k (Cp/Cv)" value={kRatio} onChange={setKRatio} min={1.1} max={1.5} step={0.01} />
                <InputField label="Efficiency" value={efficiency} onChange={setEfficiency} min={0.5} max={0.95} step={0.01} />
                <InputField label="DRA Concentration" value={draPpm} onChange={setDraPpm} min={0} max={100} suffix="ppm" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Compressor HP" value={hp.toFixed(0)} unit="HP" highlight />
                <MetricCard label="Pressure Ratio" value={pratio.toFixed(2)} />
                <MetricCard label="MW Equivalent" value={(hp * 0.0007457).toFixed(1)} unit="MW" />
                <MetricCard label="DRA Boost" value={`+${draEffect.boostedThroughputPct.toFixed(1)}%`} highlight={draPpm > 0} />
            </div>

            <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Compressor Power: <code style={{ color: '#38bdf8' }}>HP = 3.03 × Q × Z × T₁ × (r<sup>(k-1)/k</sup> - 1) / (η × (k-1)/k)</code>
                </div>
                {draPpm > 0 && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                        DRA at {draPpm} ppm: Friction reduced to {draEffect.reducedFrictionFactor.toFixed(5)} (Δf = {((1 - draEffect.reducedFrictionFactor / baseFriction) * 100).toFixed(1)}%)
                    </div>
                )}
            </div>
        </div>
    );
};

// 5.7 Marine Transport
const MarineTab: React.FC = () => {
    const [cargoBbl, setCargoBbl] = useState(1000000);
    const [distanceNm, setDistanceNm] = useState(3000);
    const [speedKnots, setSpeedKnots] = useState(14);
    const [portDays, setPortDays] = useState(3);
    const [charterRate, setCharterRate] = useState(35000);
    const [wsFlat, setWsFlat] = useState(20);
    const [wsPct, setWsPct] = useState(85);
    const [bunkerCost, setBunkerCost] = useState(150000);

    const voyageDays = useMemo(() => (distanceNm / speedKnots / 24) * 2 + portDays, [distanceNm, speedKnots, portDays]);
    const freightPerBbl = useMemo(() => (wsFlat * wsPct / 100) / cargoBbl, [wsFlat, wsPct, cargoBbl]);
    const totalCost = useMemo(() => charterRate * voyageDays + bunkerCost + 50000, [charterRate, voyageDays, bunkerCost]);
    const freightTotal = useMemo(() => freightPerBbl * cargoBbl, [freightPerBbl, cargoBbl]);

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>⛴️ Marine Transport & Shipping Economics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <InputField label="Cargo Size" value={cargoBbl} onChange={setCargoBbl} min={10000} max={3000000} step={10000} suffix="bbl" />
                <InputField label="Distance" value={distanceNm} onChange={setDistanceNm} min={100} max={15000} suffix="nm" />
                <InputField label="Speed" value={speedKnots} onChange={setSpeedKnots} min={8} max={25} suffix="knots" />
                <InputField label="Port Time" value={portDays} onChange={setPortDays} min={1} max={14} suffix="days" />
                <InputField label="Charter Rate" value={charterRate} onChange={setCharterRate} min={5000} max={150000} suffix="$/day" />
                <InputField label="WS Flat" value={wsFlat} onChange={setWsFlat} min={5} max={50} suffix="$" />
                <InputField label="WS %" value={wsPct} onChange={setWsPct} min={30} max={200} step={5} suffix="%" />
                <InputField label="Bunker Cost" value={bunkerCost} onChange={setBunkerCost} min={10000} max={500000} step={1000} suffix="$" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Voyage Time" value={voyageDays.toFixed(1)} unit="days" highlight />
                <MetricCard label="Freight ($/bbl)" value={`$${freightPerBbl.toFixed(3)}`} />
                <MetricCard label="Total Voyage Cost" value={`$${(totalCost / 1e6).toFixed(2)}M`} />
                <MetricCard label="Total Freight" value={`$${(freightTotal / 1e6).toFixed(2)}M`} highlight />
            </div>
        </div>
    );
};

// 5.8 SCADA & Automation
const ScadaTab: React.FC = () => {
    const [p1, setP1] = useState(1200);
    const [p2, setP2] = useState(600);
    const [diam, setDiam] = useState(24);
    const [lengthMi, setLengthMi] = useState(100);
    const [gasSg, setGasSg] = useState(0.6);
    const [tempR, setTempR] = useState(520);
    const [zVal, setZVal] = useState(0.85);

    const weymouthQ = useMemo(
        () => weymouthFlow(p1, p2, diam, lengthMi, gasSg, tempR, zVal),
        [p1, p2, diam, lengthMi, gasSg, tempR, zVal],
    );
    const panhandleQ = useMemo(
        () => panhandleAFlow(p1, p2, diam, lengthMi, gasSg, tempR, zVal),
        [p1, p2, diam, lengthMi, gasSg, tempR, zVal],
    );

    const [inletT, setInletT] = useState(50);
    const [ambientT, setAmbientT] = useState(10);
    const [lengthKmProfile, setLengthKmProfile] = useState(100);
    const [htc, setHtc] = useState(5);
    const [massFlow, setMassFlow] = useState(200);
    const [cpVal, setCpVal] = useState(2000);

    const tempProfile = useMemo(
        () => pipelineTemperatureProfile(inletT, ambientT, lengthKmProfile, htc, diam, massFlow, cpVal),
        [inletT, ambientT, lengthKmProfile, htc, diam, massFlow, cpVal],
    );

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>📡 SCADA, Flow Modeling & Leak Detection</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                    <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>Gas Flow Modeling</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                        <InputField label="P₁ (Inlet)" value={p1} onChange={setP1} min={100} max={3000} suffix="psia" />
                        <InputField label="P₂ (Outlet)" value={p2} onChange={setP2} min={50} max={2000} suffix="psia" />
                        <InputField label="Diameter" value={diam} onChange={setDiam} min={4} max={48} suffix="in" />
                        <InputField label="Length" value={lengthMi} onChange={setLengthMi} min={10} max={500} suffix="mi" />
                        <InputField label="Gas SG" value={gasSg} onChange={setGasSg} min={0.5} max={0.8} step={0.01} />
                        <InputField label="Temp" value={tempR} onChange={setTempR} min={400} max={600} suffix="°R" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        <MetricCard label="Weymouth Flow" value={weymouthQ.toFixed(1)} unit="MMSCFD" highlight />
                        <MetricCard label="Panhandle A Flow" value={panhandleQ.toFixed(1)} unit="MMSCFD" />
                    </div>
                </div>

                <div>
                    <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>Temperature Profile</h4>
                    <div style={{ fontSize: 11, color: '#64748b', maxHeight: 200, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155' }}>
                                    <th style={{ textAlign: 'left', padding: '2px 4px', color: '#64748b' }}>km</th>
                                    <th style={{ textAlign: 'right', padding: '2px 4px', color: '#64748b' }}>°C</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tempProfile.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '2px 4px', color: '#e2e8f0' }}>{p.xKm.toFixed(1)}</td>
                                        <td style={{ textAlign: 'right', padding: '2px 4px', color: '#38bdf8' }}>{p.tempC.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Weymouth: <code style={{ color: '#38bdf8' }}>Q = 433.5 × (Tb/Pb) × √((P₁² - P₂²)/(G × Tf × L × Z)) × D^2.667</code>
                </div>
            </div>
        </div>
    );
};

// 5.9 Midstream Economics
const MidstreamEconomicsTab: React.FC = () => {
    const [distanceKm, setDistanceKm] = useState(800);
    const [volumeBpd, setVolumeBpd] = useState(100000);
    const [discountRate, setDiscountRate] = useState(0.10);
    const [fieldLife, setFieldLife] = useState(20);

    const modes = useMemo(() => compareTransportModes(DEFAULT_TRANSPORT_MODES, distanceKm, volumeBpd, fieldLife), [distanceKm, volumeBpd, fieldLife]);
    const npvs = useMemo(
        () =>
            modes
                .filter((m) => m.feasible)
                .map((m) => ({ name: m.name, ...calculateTransportNPV(m.capex, m.annualOpex, discountRate, fieldLife) })),
        [modes, discountRate, fieldLife],
    );

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>💰 Midstream Economics & Tariff Design</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <InputField label="Distance" value={distanceKm} onChange={setDistanceKm} min={10} max={5000} suffix="km" />
                <InputField label="Volume" value={volumeBpd} onChange={setVolumeBpd} min={1000} max={500000} step={1000} suffix="bpd" />
                <InputField label="Discount Rate" value={discountRate * 100} onChange={(v) => setDiscountRate(v / 100)} min={1} max={30} suffix="%" />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b' }}>Mode</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b' }}>CAPEX ($M)</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b' }}>NPV ($M)</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b' }}>Annualized Cost ($M)</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b' }}>Feasible</th>
                    </tr>
                </thead>
                <tbody>
                    {modes.map((m) => {
                        const npvData = npvs.find((n) => n.name === m.name);
                        return (
                            <tr key={m.name} style={{ borderBottom: '1px solid #1e293b', opacity: m.feasible ? 1 : 0.4 }}>
                                <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{m.name}</td>
                                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#e2e8f0' }}>${(m.capex / 1e6).toFixed(1)}</td>
                                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#38bdf8' }}>{npvData ? `$${(npvData.npv / 1e6).toFixed(1)}` : 'N/A'}</td>
                                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#e2e8f0' }}>{npvData ? `$${(npvData.annualizedCost / 1e6).toFixed(1)}` : 'N/A'}</td>
                                <td style={{ textAlign: 'right', padding: '6px 8px', color: m.feasible ? '#4ade80' : '#ef4444' }}>{m.feasible ? '✅' : '❌'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontSize: 11, color: '#64748b' }}>
                Tariff design typically targets cost recovery over field life plus regulated rate of return (8-12%).
                NPV calculated using discounted cash flow over {fieldLife} years at {discountRate * 100}% discount rate.
            </div>
        </div>
    );
};

// 5.10 HSE & Regulatory (Midstream)
const HseTab: React.FC = () => {
    const [jurisdictionCount, setJurisdictionCount] = useState(3);
    const [envSensitivity, setEnvSensitivity] = useState(0.4);
    const [indigenousConsult, setIndigenousConsult] = useState(true);
    const [crossBorder, setCrossBorder] = useState(false);

    const permitting = useMemo(
        () => estimatePermittingTimeline(jurisdictionCount, envSensitivity, indigenousConsult, crossBorder),
        [jurisdictionCount, envSensitivity, indigenousConsult, crossBorder],
    );

    return (
        <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>🛑 HSE & Regulatory (Midstream)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <InputField label="Jurisdictions" value={jurisdictionCount} onChange={setJurisdictionCount} min={1} max={10} step={1} />
                <InputField label="Env Sensitivity (0-1)" value={envSensitivity} onChange={setEnvSensitivity} min={0} max={1} step={0.05} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 11, color: '#64748b' }}>Indigenous Consultation</label>
                    <input type="checkbox" checked={indigenousConsult} onChange={(e) => setIndigenousConsult(e.target.checked)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 11, color: '#64748b' }}>Cross-Border</label>
                    <input type="checkbox" checked={crossBorder} onChange={(e) => setCrossBorder(e.target.checked)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <MetricCard label="Expected Duration" value={Math.round(permitting.expectedMonths)} unit="months" highlight />
                <MetricCard label="Min Duration" value={Math.round(permitting.minMonths)} unit="months" />
                <MetricCard label="Max Duration" value={Math.round(permitting.maxMonths)} unit="months" />
            </div>

            <div>
                <h4 style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Key Regulatory Milestones</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {permitting.keyMilestones.map((m) => (
                        <span key={m} style={{ padding: '4px 10px', background: '#1e293b', borderRadius: 12, fontSize: 11, color: '#38bdf8', border: '1px solid #334155' }}>
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN MIDSTREAM STAGE
// ═══════════════════════════════════════════════════════════════

const TABS: { id: MidstreamTabId; label: string; icon: string }[] = [
    { id: 'transport', label: 'Transport Mode', icon: '⛴' },
    { id: 'pipeline-design', label: 'Pipeline Design', icon: '🔧' },
    { id: 'construction', label: 'Construction', icon: '🚧' },
    { id: 'storage', label: 'Storage', icon: '🏗️' },
    { id: 'integrity', label: 'Integrity', icon: '🛡️' },
    { id: 'pump-compressor', label: 'Stations', icon: '⚡' },
    { id: 'marine', label: 'Marine', icon: '🚢' },
    { id: 'scada', label: 'SCADA', icon: '📡' },
    { id: 'economics', label: 'Economics', icon: '💰' },
    { id: 'hse', label: 'HSE & Reg', icon: '🛑' },
];

const MidstreamStage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MidstreamTabId>('transport');
    const production = useProduction();
    const midstream = useMidstream();

    useEffect(() => {
        const fa = production.data.fieldAggregate;
        if (fa && (fa.totalOilRate || fa.totalGasRate || fa.totalLiquidRate)) {
            const throughput = fa.totalLiquidRate || fa.totalOilRate || 0;
            midstream.update({
                pipeline: {
                    ...midstream.data.pipeline,
                    currentThroughput: throughput,
                },
                storage: {
                    ...midstream.data.storage,
                    terminal: {
                        ...midstream.data.storage?.terminal,
                        receiptRate: throughput,
                    },
                },
            });
        }
    }, [
        production.data.fieldAggregate?.totalOilRate,
        production.data.fieldAggregate?.totalGasRate,
        production.data.fieldAggregate?.totalLiquidRate,
    ]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'transport':
                return <TransportationModeSelection />;
            case 'pipeline-design':
                return <PipelineDesignTab />;
            case 'construction':
                return <ConstructionTab />;
            case 'storage':
                return <StorageTab />;
            case 'integrity':
                return <IntegrityTab />;
            case 'pump-compressor':
                return <PumpCompressorTab />;
            case 'marine':
                return <MarineTab />;
            case 'scada':
                return <ScadaTab />;
            case 'economics':
                return <MidstreamEconomicsTab />;
            case 'hse':
                return <HseTab />;
            default:
                return null;
        }
    };

    return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 1400, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#e2e8f0' }}>
                🚛 Phase 5: Midstream Transportation & Storage
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>
                Pipeline design, construction, storage terminals, marine shipping, integrity management, and midstream economics — the complete surface transport value chain.
            </p>

            {/* Sub-Tab Navigation */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid #334155', overflowX: 'auto', flexWrap: 'wrap' }}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 16px',
                            background: activeTab === tab.id ? '#1e293b' : 'transparent',
                            color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '3px solid #38bdf8' : '3px solid transparent',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span style={{ marginRight: 6 }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: 400 }}>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default MidstreamStage;