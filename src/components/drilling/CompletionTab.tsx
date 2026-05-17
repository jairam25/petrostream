/**
 * Well Completion Engineering Tab
 * Perforation design, casing analysis, sand control, gravel pack, ICD, tubing, brine
 */
import React, { useState, useMemo } from 'react';
import {
    PerforationInputs, CasingDesignInputs, GravelPackInputs, ICDInputs,
    TubingStringInputs, SandControlInputs, CompletionFluidInputs,
    calculatePerforationSkin, evaluateCasingTriaxial, designGravelPack,
    designICDNozzles, analyzeTubingString, recommendSandControl,
    designCompletionBrine, estimateCompletionLeakoff
} from '../../lib/completion';

// ── Perforation Panel ──
const PerforationPanel: React.FC = () => {
    const [formationPerm, setFormationPerm] = useState(50);
    const [porosity, setPorosity] = useState(0.18);
    const [shotDensity, setShotDensity] = useState(12);
    const [perfDiameter, setPerfDiameter] = useState(0.4);
    const [perfLength, setPerfLength] = useState(18);
    const [wellRadius, setWellRadius] = useState(4.25);
    const [damageSkin, setDamageSkin] = useState(2);
    const [compactionSkin, setCompactionSkin] = useState(1.5);
    const [anisotropy, setAnisotropy] = useState(0.3);

    const inputs: PerforationInputs = { formationPerm, porosity, shotDensity, perfDiameter, perfLength, wellRadius, damageSkin, compactionSkin, anisotropy };
    const result = useMemo(() => calculatePerforationSkin(inputs), [inputs]);

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Perforation Engineering (Karasiak/Tariq)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Formation Permeability (mD)</label>
                    <input type="number" value={formationPerm} onChange={e => setFormationPerm(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Porosity (fraction)</label>
                    <input type="number" value={porosity} onChange={e => setPorosity(parseFloat(e.target.value) || 0)} step="0.01" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Shot Density (spf)</label>
                    <select value={shotDensity} onChange={e => setShotDensity(parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
                        <option value={4}>4 SPF</option>
                        <option value={6}>6 SPF</option>
                        <option value={8}>8 SPF</option>
                        <option value={12}>12 SPF</option>
                        <option value={16}>16 SPF</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Perf Diameter (inches)</label>
                    <input type="number" value={perfDiameter} onChange={e => setPerfDiameter(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Perf Length (inches)</label>
                    <input type="number" value={perfLength} onChange={e => setPerfLength(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Damage Skin</label>
                    <input type="number" value={damageSkin} onChange={e => setDamageSkin(parseFloat(e.target.value) || 0)} step="0.5" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3">
                    <div className="text-xs text-slate-400">Skin Breakdown</div>
                    <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Convergence Skin:</span><span className="text-cyan-300">{result.convergenceSkin}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Wellbore Skin:</span><span className="text-cyan-300">{result.wellboreSkin}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Compaction Skin:</span><span className="text-cyan-300">{result.compactionSkinTotal}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-700"><span className="text-slate-400 font-semibold">Total Skin:</span><span className={`font-bold ${result.totalSkin < 2 ? 'text-green-400' : result.totalSkin < 5 ? 'text-amber-400' : 'text-red-400'}`}>{result.totalSkin}</span></div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Productivity Ratio</div>
                    <div className={`text-2xl font-bold mt-2 ${result.productivityRatio > 0.7 ? 'text-green-400' : result.productivityRatio > 0.4 ? 'text-amber-400' : 'text-red-400'}`}>{result.productivityRatio.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">CFD: {result.cfd.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

// ── Casing Design Panel ──
const CasingDesignPanel: React.FC = () => {
    const [collapsePressure, setCollapsePressure] = useState(4500);
    const [burstPressure, setBurstPressure] = useState(6800);
    const [axialLoad, setAxialLoad] = useState(250000);
    const [casingOD, setCasingOD] = useState(7);
    const [wallThickness, setWallThickness] = useState(0.362);
    const [grade, setGrade] = useState('P-110');
    const [connectionType, setConnectionType] = useState('VAM TOP');
    const [sourService, setSourService] = useState(false);

    const inputs: CasingDesignInputs = { collapsePressure, burstPressure, axialLoad, casingOD, wallThickness, grade, connectionType, sourService };
    const result = useMemo(() => evaluateCasingTriaxial(inputs), [inputs]);

    const grades = ['H-40', 'J-55', 'K-55', 'N-80', 'L-80', 'C-90', 'T-95', 'P-110', 'Q-125', 'V-150'];

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Casing Triaxial Stress (Von Mises)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Collapse Pressure (psi)</label>
                    <input type="number" value={collapsePressure} onChange={e => setCollapsePressure(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Burst Pressure (psi)</label>
                    <input type="number" value={burstPressure} onChange={e => setBurstPressure(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Axial Load (lbf)</label>
                    <input type="number" value={axialLoad} onChange={e => setAxialLoad(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Grade</label>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Wall Thickness (inches)</label>
                    <input type="number" value={wallThickness} onChange={e => setWallThickness(parseFloat(e.target.value) || 0)} step="0.001" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={sourService} onChange={e => setSourService(e.target.checked)} className="rounded" />
                    <label className="text-xs text-slate-400">Sour Service (NACE MR0175)</label>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Von Mises Stress</div>
                    <div className="text-xl text-cyan-400 font-bold">{result.vonMises.toLocaleString()} <span className="text-xs">psi</span></div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Design Factor</div>
                    <div className={`text-xl font-bold ${result.designFactor >= 1.25 ? 'text-green-400' : result.designFactor >= 1.0 ? 'text-amber-400' : 'text-red-400'}`}>{result.designFactor.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">NACE Compliant</div>
                    <div className={`text-lg font-bold ${result.naceCompliant ? 'text-green-400' : 'text-red-400'}`}>{result.naceCompliant ? '✓ YES' : '✗ NO'}</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-800/60 rounded p-1.5"><span className="text-slate-400">Collapse DF:</span> <span className={result.collapseDF >= 1.25 ? 'text-green-400' : 'text-amber-400'}>{result.collapseDF.toFixed(2)}</span></div>
                <div className="bg-slate-800/60 rounded p-1.5"><span className="text-slate-400">Burst DF:</span> <span className={result.burstDF >= 1.25 ? 'text-green-400' : 'text-amber-400'}>{result.burstDF.toFixed(2)}</span></div>
                <div className="bg-slate-800/60 rounded p-1.5"><span className="text-slate-400">Axial DF:</span> <span className={result.axialDF >= 1.25 ? 'text-green-400' : 'text-amber-400'}>{result.axialDF.toFixed(2)}</span></div>
            </div>
            <div className={`text-xs p-2 rounded ${result.designFactor >= 1.25 ? 'bg-green-900/30 text-green-300' : result.designFactor >= 1.0 ? 'bg-amber-900/30 text-amber-300' : 'bg-red-900/30 text-red-300'}`}>{result.suitability}</div>
        </div>
    );
};

// ── Sand Control Panel ──
const SandControlPanel: React.FC = () => {
    const [formationD50, setFormationD50] = useState(150);
    const [uniformityCoeff, setUniformityCoeff] = useState(3.5);
    const [finesFrac, setFinesFrac] = useState(0.04);
    const [wellDeviation, setWellDeviation] = useState(45);
    const [expectedRate, setExpectedRate] = useState(500);
    const [fluidVisc, setFluidVisc] = useState(1.2);

    const inputs: SandControlInputs = { formationD50, uniformityCoeff, finesFrac, wellDeviation, expectedRate, fluidVisc };
    const result = useMemo(() => recommendSandControl(inputs), [inputs]);

    const riskColor = result.riskLevel === 'low' ? 'text-green-400' : result.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400';

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Sand Control Selection (Saucier)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Formation D50 (microns)</label>
                    <input type="number" value={formationD50} onChange={e => setFormationD50(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Uniformity Coefficient (D40/D90)</label>
                    <input type="number" value={uniformityCoeff} onChange={e => setUniformityCoeff(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Fines Fraction ({'<44 micron)'}</label>
                    <input type="number" value={finesFrac} onChange={e => setFinesFrac(parseFloat(e.target.value) || 0)} step="0.01" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Well Deviation (degrees)</label>
                    <input type="number" value={wellDeviation} onChange={e => setWellDeviation(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Expected Rate (bbl/day)</label>
                    <input type="number" value={expectedRate} onChange={e => setExpectedRate(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Fluid Viscosity (cP)</label>
                    <input type="number" value={fluidVisc} onChange={e => setFluidVisc(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Method:</span><span className="text-cyan-300 font-semibold">{result.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Screen Type:</span><span className="text-cyan-300">{result.screenType}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gravel Size:</span><span className="text-cyan-300">{result.gravelSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Level:</span><span className={`font-bold uppercase ${riskColor}`}>{result.riskLevel}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1"><span className="text-slate-500">Rationale:</span> {result.rationale}</div>
                <div className="text-xs text-slate-400"><span className="text-slate-500">Alternative:</span> {result.alternative}</div>
            </div>
        </div>
    );
};

// ── Gravel Pack Panel ──
const GravelPackPanel: React.FC = () => {
    const [formationSandD50, setFormationSandD50] = useState(120);
    const [gravelSize, setGravelSize] = useState('20/40');
    const [perfLength, setPerfLength] = useState(50);
    const [annulusOD, setAnnulusOD] = useState(8.5);
    const [screenOD, setScreenOD] = useState(4.0);
    const [pumpRate, setPumpRate] = useState(4);
    const [carrierFluidVisc, setCarrierFluidVisc] = useState(30);

    const inputs: GravelPackInputs = { formationSandD50, gravelSize, perfLength, annulusOD, screenOD, pumpRate, carrierFluidVisc };
    const result = useMemo(() => designGravelPack(inputs), [inputs]);

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Gravel Pack Design</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Formation D50 (microns)</label>
                    <input type="number" value={formationSandD50} onChange={e => setFormationSandD50(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Gravel Size</label>
                    <select value={gravelSize} onChange={e => setGravelSize(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
                        <option value="20/40">20/40</option>
                        <option value="40/60">40/60</option>
                        <option value="16/30">16/30</option>
                        <option value="12/20">12/20</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Perforated Interval (ft)</label>
                    <input type="number" value={perfLength} onChange={e => setPerfLength(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Screen OD (inches)</label>
                    <input type="number" value={screenOD} onChange={e => setScreenOD(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Saucier Ratio</div>
                    <div className={`text-xl font-bold ${result.isSaucierCompliant ? 'text-green-400' : 'text-red-400'}`}>{result.saucierRatio.toFixed(1)}</div>
                    <div className="text-xs text-slate-500">{result.isSaucierCompliant ? '✓ Compliant (3-8)' : '⚠ Outside range'}</div>
                </div>
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Pump Rate Range</div>
                    <div className="text-lg text-cyan-400 font-bold">{result.pumpRateMin.toFixed(1)} – {result.pumpRateMax.toFixed(1)} <span className="text-xs">bpm</span></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/60 rounded p-2 text-center">
                    <span className="text-slate-400">Gravel Volume:</span>
                    <div className="text-cyan-300 font-semibold">{result.gravelVolumeBbl.toFixed(1)} bbl</div>
                </div>
                <div className="bg-slate-800/60 rounded p-2 text-center">
                    <span className="text-slate-400">Gravel Mass:</span>
                    <div className="text-cyan-300 font-semibold">{result.gravelMassLb.toLocaleString()} lb</div>
                </div>
                <div className="bg-slate-800/60 rounded p-2 text-center">
                    <span className="text-slate-400">Carrier Visco:</span>
                    <div className="text-cyan-300 font-semibold">{result.carrierViscRequired} cP</div>
                </div>
            </div>
        </div>
    );
};

// ── ICD Design Panel ──
const ICDPanel: React.FC = () => {
    const [zonePerm, setZonePerm] = useState('50, 120, 80, 200');
    const [zoneLength, setZoneLength] = useState('30, 25, 35, 20');
    const [zonePressure, setZonePressure] = useState('4200, 4150, 4120, 4080');
    const [targetDrawdown, setTargetDrawdown] = useState(500);
    const [fluidVisc, setFluidVisc] = useState(1.0);

    const inputs: ICDInputs = {
        zonePerm: zonePerm.split(',').map(Number),
        zoneLength: zoneLength.split(',').map(Number),
        zonePressure: zonePressure.split(',').map(Number),
        targetDrawdown,
        wellRadius: 4.25,
        fluidVisc,
        fluidDensity: 8.34
    };
    const result = useMemo(() => designICDNozzles(inputs), [inputs]);

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">ICD / Flow Control Design</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Zone Permeabilities (mD, comma-sep)</label>
                    <input type="text" value={zonePerm} onChange={e => setZonePerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Zone Lengths (ft, comma-sep)</label>
                    <input type="text" value={zoneLength} onChange={e => setZoneLength(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Zone Pressures (psi, comma-sep)</label>
                    <input type="text" value={zonePressure} onChange={e => setZonePressure(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Target Drawdown (psi)</label>
                    <input type="number" value={targetDrawdown} onChange={e => setTargetDrawdown(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                <div className="text-xs text-slate-400">Even Sweep Efficiency</div>
                <div className={`text-xl font-bold ${result.evenSweepEfficiency > 0.8 ? 'text-green-400' : 'text-amber-400'}`}>{(result.evenSweepEfficiency * 100).toFixed(0)}%</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-700">
                            <th className="text-left p-1">Zone</th>
                            <th className="text-right p-1">Nozzle (in)</th>
                            <th className="text-right p-1">Rate (bbl/d)</th>
                            <th className="text-right p-1">ΔP (psi)</th>
                            <th className="text-right p-1">Drawdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.nozzleSizes.map((n, i) => (
                            <tr key={i} className="border-b border-slate-800">
                                <td className="p-1">{i + 1}</td>
                                <td className="text-right p-1 text-cyan-300 font-mono">{n.toFixed(2)}</td>
                                <td className="text-right p-1">{result.flowRatesPerZone[i]}</td>
                                <td className="text-right p-1">{result.pressureDropPerZone[i]}</td>
                                <td className="text-right p-1">{result.drawdownProfile[i].dd}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── Tubing String Panel ──
const TubingStringPanel: React.FC = () => {
    const [depth, setDepth] = useState(12000);
    const [tubingOD, setTubingOD] = useState(3.5);
    const [tubingID, setTubingID] = useState(2.992);
    const [tubingWeight, setTubingWeight] = useState(9.3);
    const [grade, setGrade] = useState('L-80');
    const [packerDepth, setPackerDepth] = useState(12000);
    const [annulusFluidDensity, setAnnulusFluidDensity] = useState(10.0);
    const [tubingPressure, setTubingPressure] = useState(4500);
    const [annulusPressure, setAnnulusPressure] = useState(0);
    const [temperature, setTemperature] = useState(250);

    const inputs: TubingStringInputs = { depth, tubingOD, tubingID, tubingWeight, grade, packerDepth, annulusFluidDensity, tubingPressure, annulusPressure, temperature };
    const result = useMemo(() => analyzeTubingString(inputs), [inputs]);

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Tubing String Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Depth (ft)</label>
                    <input type="number" value={depth} onChange={e => setDepth(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Tubing OD (inches)</label>
                    <input type="number" value={tubingOD} onChange={e => setTubingOD(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Tubing ID (inches)</label>
                    <input type="number" value={tubingID} onChange={e => setTubingID(parseFloat(e.target.value) || 0)} step="0.001" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Grade</label>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
                        {['H-40', 'J-55', 'N-80', 'L-80', 'C-90', 'T-95', 'P-110'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Tubing Pressure (psi)</label>
                    <input type="number" value={tubingPressure} onChange={e => setTubingPressure(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Temperature (°F)</label>
                    <input type="number" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Buoyed Weight</div>
                    <div className="text-lg text-cyan-400 font-bold">{result.buoyedWeight.toLocaleString()} <span className="text-xs">lbf</span></div>
                </div>
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Piston Force</div>
                    <div className={`text-lg font-bold ${result.bucklingForce > 0 ? 'text-red-400' : 'text-cyan-400'}`}>{result.pistonForce.toLocaleString()} <span className="text-xs">lbf</span></div>
                </div>
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
                    <div className="text-xs text-slate-400">Neutral Point</div>
                    <div className="text-lg text-cyan-400 font-bold">{result.neutralPoint.toLocaleString()} <span className="text-xs">ft</span></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-slate-800/60 rounded p-1.5"><span className="text-slate-400">Elongation:</span> <span className="text-cyan-300">{result.elongation.toFixed(1)} in</span></div>
                <div className="bg-slate-800/60 rounded p-1.5"><span className="text-slate-400">DF:</span> <span className={result.designFactor >= 1.25 ? 'text-green-400' : 'text-amber-400'}>{result.designFactor.toFixed(2)}</span></div>
            </div>
            {result.bucklingForce > 0 && <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">⚠ Helical buckling predicted — {result.bucklingForce.toLocaleString()} lbf above critical load</div>}
        </div>
    );
};

// ── Brine Design Panel ──
const BrineDesignPanel: React.FC = () => {
    const [formationPressure, setFormationPressure] = useState(6800);
    const [depth, setDepth] = useState(10000);
    const [overbalanceMargin, setOverbalanceMargin] = useState(300);
    const [perm, setPerm] = useState(80);
    const [exposureTime, setExposureTime] = useState(48);
    const [zoneLength, setZoneLength] = useState(200);

    const fluidInputs: CompletionFluidInputs = { formationPressure, depth, overbalanceMargin, fluidType: 'brine', baseDensity: 8.34 };
    const brine = useMemo(() => designCompletionBrine(fluidInputs), [fluidInputs]);
    const leakoff = useMemo(() => estimateCompletionLeakoff(perm, brine.overbalance, 1.0, exposureTime, zoneLength), [perm, brine.overbalance, exposureTime, zoneLength]);

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-700 pb-2">Completion Brine & Leakoff</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">Formation Pressure (psi)</label>
                    <input type="number" value={formationPressure} onChange={e => setFormationPressure(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Depth (ft)</label>
                    <input type="number" value={depth} onChange={e => setDepth(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Overbalance Margin (psi)</label>
                    <input type="number" value={overbalanceMargin} onChange={e => setOverbalanceMargin(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Exposure Time (hours)</label>
                    <input type="number" value={exposureTime} onChange={e => setExposureTime(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Brine Design</div>
                    <div className="text-sm text-cyan-300">{brine.brineType}</div>
                    <div className="text-xs text-slate-500 mt-1">Density: {brine.requiredDensity.toFixed(2)} ppg</div>
                    <div className="text-xs text-slate-500">Overbalance: {brine.overbalance.toFixed(0)} psi</div>
                    <div className="text-xs text-slate-500">Volume: {brine.brineVolumeBbl.toFixed(1)} bbl</div>
                    <div className="text-xs text-slate-500">Cryst. Temp: {brine.crystallizationTemp}°F</div>
                </div>
                <div className="bg-slate-800 border border-cyan-600/30 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Leakoff Estimate</div>
                    <div className={`text-sm font-semibold ${leakoff.damageSeverity === 'minimal' ? 'text-green-400' : leakoff.damageSeverity === 'moderate' ? 'text-amber-400' : 'text-red-400'}`}>{leakoff.damageSeverity.toUpperCase()}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Loss: {leakoff.totalLossBbl.toFixed(1)} bbl</div>
                    <div className="text-xs text-slate-500">Invasion: {leakoff.invasionDepthFt.toFixed(1)} ft</div>
                    <div className="text-xs text-slate-400 mt-1">{leakoff.recommendation}</div>
                </div>
            </div>
        </div>
    );
};

// ── Main CompletionTab ──
const CompletionTab: React.FC = () => {
    const [activePanel, setActivePanel] = useState<string>('perf');

    const panels: { key: string; label: string }[] = [
        { key: 'perf', label: 'Perforation' },
        { key: 'casing', label: 'Casing Stress' },
        { key: 'sand', label: 'Sand Control' },
        { key: 'gravel', label: 'Gravel Pack' },
        { key: 'icd', label: 'ICD Design' },
        { key: 'tubing', label: 'Tubing String' },
        { key: 'brine', label: 'Brine & Leakoff' }
    ];

    return (
        <div className="text-white">
            <div className="flex flex-wrap gap-1 mb-4">
                {panels.map(p => (
                    <button
                        key={p.key}
                        onClick={() => setActivePanel(p.key)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activePanel === p.key ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        {p.label}
                    </button>
                ))}
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                {activePanel === 'perf' && <PerforationPanel />}
                {activePanel === 'casing' && <CasingDesignPanel />}
                {activePanel === 'sand' && <SandControlPanel />}
                {activePanel === 'gravel' && <GravelPackPanel />}
                {activePanel === 'icd' && <ICDPanel />}
                {activePanel === 'tubing' && <TubingStringPanel />}
                {activePanel === 'brine' && <BrineDesignPanel />}
            </div>
        </div>
    );
};

export default CompletionTab;