/**
 * Well Stimulation Engineering Tab
 * Hydraulic Fracturing (PKN/KGD), Acidizing, Proppant Selection, DFIT, Diversion, Flowback
 */
import React, { useState, useMemo } from 'react';
import {
    calculateFractureGeometry, generateProppantSchedule, analyzeDFIT,
    designAcidTreatment, selectProppant, designDiversion, predictFlowback,
    calculateAcidReaction,
    FractureGeometryInputs, ProppantScheduleInputs, DFITInputs,
    AcidizingInputs, ProppantSelectionInputs
} from '../../lib/stimulation';

// ── Fracture Geometry (PKN/KGD) Panel ──
const FractureGeometryPanel: React.FC = () => {
    const [model, setModel] = useState<'PKN' | 'KGD'>('PKN');
    const [pumpRate, setPumpRate] = useState(40);
    const [totalVolume, setTotalVolume] = useState(5000);
    const [fluidViscosity, setFluidViscosity] = useState(100);
    const [youngsModulus, setYoungsModulus] = useState(3000000);
    const [poissonsRatio, setPoissonsRatio] = useState(0.25);
    const [height, setHeight] = useState(150);
    const [fluidLossCoeff, setFluidLossCoeff] = useState(0.003);
    const [numberOfPerfs, setNumberOfPerfs] = useState(40);
    const [perfDiameter, setPerfDiameter] = useState(0.42);

    const inputs: FractureGeometryInputs = { pumpRate, totalVolume, fluidViscosity, youngsModulus, poissonsRatio, height, fluidLossCoeff, model, numberOfPerfs, perfDiameter };
    const result = useMemo(() => calculateFractureGeometry(inputs), [JSON.stringify(inputs)]);

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Fracture Geometry — {model} Model</h3>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Model</label>
                    <select value={model} onChange={e => setModel(e.target.value as 'PKN' | 'KGD')} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]">
                        <option value="PKN">PKN (Height-Fixed)</option>
                        <option value="KGD">KGD (Frac-Limited)</option>
                    </select>
                </div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Pump Rate (bpm)</label><input type="number" value={pumpRate} onChange={e => setPumpRate(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Total Volume (bbl)</label><input type="number" value={totalVolume} onChange={e => setTotalVolume(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Fluid Visc (cP)</label><input type="number" value={fluidViscosity} onChange={e => setFluidViscosity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Young's Mod (psi)</label><input type="number" value={youngsModulus} onChange={e => setYoungsModulus(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Poisson's ν</label><input type="number" step="0.01" value={poissonsRatio} onChange={e => setPoissonsRatio(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Frac Height (ft)</label><input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Fluid Loss Coeff (ft/√min)</label><input type="number" step="0.0001" value={fluidLossCoeff} onChange={e => setFluidLossCoeff(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1"># Perforations</label><input type="number" value={numberOfPerfs} onChange={e => setNumberOfPerfs(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Perf Diam (in)</label><input type="number" step="0.01" value={perfDiameter} onChange={e => setPerfDiameter(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                    ['Frac Half-Length', `${result.fracHalfLength} ft`, '#06b6d4'],
                    ['Frac Width', `${result.fracWidth} in`, '#a78bfa'],
                    ['Net Pressure', `${result.netPressure} psi`, '#f59e0b'],
                    ['Fluid Efficiency', `${(result.efficiency * 100).toFixed(0)}%`, '#10b981'],
                    ['Created Area', `${result.createdArea.toLocaleString()} ft²`, '#ec4899']
                ].map(([label, val, color], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</div>
                        <div className="text-sm font-black mt-1" style={{ color }}>{val}</div>
                    </div>
                ))}
            </div>
            <div className="text-slate-600 text-[11px] space-y-0.5">
                <div>Perf Friction: {result.perfFriction} psi &nbsp;|&nbsp; Near-Wellbore ΔP: {result.nearWellboreDP} psi</div>
            </div>
        </div>
    );
};

// ── Proppant Schedule Panel ──
const ProppantSchedulePanel: React.FC = () => {
    const [fracLength, setFracLength] = useState(800);
    const [fracHeight, setFracHeight] = useState(150);
    const [fracWidth, setFracWidth] = useState(0.35);
    const [targetConductivity, setTargetConductivity] = useState(40000);
    const [maxProppantConc, setMaxProppantConc] = useState(8);
    const [proppantSize, setProppantSize] = useState('20/40');
    const [closureStress, setClosureStress] = useState(5000);

    const inputs: ProppantScheduleInputs = { fracLength, fracHeight, fracWidth, targetConductivity, maxProppantConc, proppantSize, proppantSG: 2.65, closureStress };
    const result = useMemo(() => generateProppantSchedule(inputs), [JSON.stringify(inputs)]);

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Proppant Ramp Schedule</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Frac Length (ft)</label><input type="number" value={fracLength} onChange={e => setFracLength(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Frac Height (ft)</label><input type="number" value={fracHeight} onChange={e => setFracHeight(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Frac Width (in)</label><input type="number" step="0.01" value={fracWidth} onChange={e => setFracWidth(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Max PPA</label><input type="number" value={maxProppantConc} onChange={e => setMaxProppantConc(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Proppant Size</label><select value={proppantSize} onChange={e => setProppantSize(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]"><option>20/40</option><option>30/50</option><option>40/70</option></select></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase tracking-widest block mb-1">Closure Stress (psi)</label><input type="number" value={closureStress} onChange={e => setClosureStress(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                    <thead>
                        <tr className="text-slate-500 uppercase tracking-widest font-black">
                            <th className="text-left p-1 border-b border-white/5">Stage</th>
                            <th className="text-right p-1 border-b border-white/5">PPA</th>
                            <th className="text-right p-1 border-b border-white/5">Clean Vol (bbl)</th>
                            <th className="text-right p-1 border-b border-white/5">Slurry Vol (bbl)</th>
                            <th className="text-right p-1 border-b border-white/5">Duration (min)</th>
                            <th className="text-right p-1 border-b border-white/5">Prop (lb)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.stages.map(s => (
                            <tr key={s.stage} className="border-b border-white/5 hover:bg-white/5">
                                <td className="p-1 text-white font-bold">{s.stage}</td>
                                <td className="p-1 text-right text-cyan-400 font-bold">{s.ppa}</td>
                                <td className="p-1 text-right text-slate-400">{s.cleanVolBbl}</td>
                                <td className="p-1 text-right text-white">{s.slurryVolBbl}</td>
                                <td className="p-1 text-right text-slate-400">{s.durationMin}</td>
                                <td className="p-1 text-right text-amber-400 font-bold">{s.proppantLb.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    ['Total Proppant', `${result.totalProppantLb.toLocaleString()} lb`],
                    ['Total Slurry', `${result.totalSlurryBbl} bbl`],
                    ['Avg Conductivity', `${result.averageConductivityMdFt.toLocaleString()} md-ft`],
                    ['Frac Conductivity', `${result.finalFracConductivity.toLocaleString()} md-ft`]
                ].map(([label, val], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black text-white mt-1">{val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── DFIT Analysis Panel ──
const DFITPanel: React.FC = () => {
    const [isip, setIsip] = useState(6500);
    const [closurePressure, setClosurePressure] = useState(5200);
    const [porePressure, setPorePressure] = useState(4500);
    const [pumpTime, setPumpTime] = useState(15);
    const [injectionVolume, setInjectionVolume] = useState(50);
    const [formationPerm, setFormationPerm] = useState(0.1);
    const [porosity, setPorosity] = useState(0.08);
    const [fluidViscosity, setFluidViscosity] = useState(10);
    const [netExtensionPressure, setNetExtensionPressure] = useState(1300);

    const inputs: DFITInputs = { isip, closurePressure, porePressure, pumpTime, injectionVolume, formationPerm, porosity, fluidViscosity, netExtensionPressure };
    const result = useMemo(() => analyzeDFIT(inputs), [JSON.stringify(inputs)]);

    const qualityColor = result.quality === 'excellent' ? '#10b981' : result.quality === 'good' ? '#06b6d4' : result.quality === 'fair' ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">DFIT Analysis — G-Function Closure</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">ISIP (psi)</label><input type="number" value={isip} onChange={e => setIsip(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Closure Press (psi)</label><input type="number" value={closurePressure} onChange={e => setClosurePressure(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Pore Press (psi)</label><input type="number" value={porePressure} onChange={e => setPorePressure(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Pump Time (min)</label><input type="number" value={pumpTime} onChange={e => setPumpTime(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Inj Volume (bbl)</label><input type="number" value={injectionVolume} onChange={e => setInjectionVolume(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Form Perm (mD)</label><input type="number" step="0.001" value={formationPerm} onChange={e => setFormationPerm(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Porosity (frac)</label><input type="number" step="0.01" value={porosity} onChange={e => setPorosity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Fluid Visc (cP)</label><input type="number" value={fluidViscosity} onChange={e => setFluidViscosity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    ['Frac Gradient', `${result.fractureGradient} psi/ft`],
                    ['Net Pressure', `${result.netPressure} psi`],
                    ['Closure Time', `${result.closureTimeMin} min`],
                    ['G-Closure', `${result.gClosureTime}`]
                ].map(([label, val], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black text-white mt-1">{val}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] font-black uppercase mb-1">Flow Regime</div>
                    <div className="text-[10px] text-white leading-relaxed">{result.flowRegime}</div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase mb-1">DFIT Quality</div>
                    <div className="text-lg font-black uppercase" style={{ color: qualityColor }}>{result.quality}</div>
                </div>
            </div>
        </div>
    );
};

// ── Acidizing Design Panel ──
const AcidizingPanel: React.FC = () => {
    const [formationType, setFormationType] = useState<'carbonate' | 'sandstone' | 'mixed'>('carbonate');
    const [permeability, setPermeability] = useState(50);
    const [porosity, setPorosity] = useState(0.15);
    const [damageRadius, setDamageRadius] = useState(2);
    const [wellRadius, setWellRadius] = useState(0.354);
    const [treatmentHeight, setTreatmentHeight] = useState(100);
    const [acidType, setAcidType] = useState('HCl (15%)');
    const [acidVolume, setAcidVolume] = useState(50);
    const [reactionRateConstant, setReactionRateConstant] = useState(0.0015);
    const [wormholeEfficiency, setWormholeEfficiency] = useState(0.6);

    const inputs: AcidizingInputs = { formationType, permeability, porosity, damageRadius, wellRadius, treatmentHeight, acidType, acidVolume, reactionRateConstant, wormholeEfficiency };
    const result = useMemo(() => designAcidTreatment(inputs), [JSON.stringify(inputs)]);

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Matrix Acidizing Design</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Formation</label><select value={formationType} onChange={e => setFormationType(e.target.value as typeof formationType)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]"><option>carbonate</option><option>sandstone</option><option>mixed</option></select></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Perm (mD)</label><input type="number" value={permeability} onChange={e => setPermeability(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Porosity</label><input type="number" step="0.01" value={porosity} onChange={e => setPorosity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Damage Rad (ft)</label><input type="number" step="0.1" value={damageRadius} onChange={e => setDamageRadius(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Treat Ht (ft)</label><input type="number" value={treatmentHeight} onChange={e => setTreatmentHeight(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Acid Type</label><select value={acidType} onChange={e => setAcidType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]"><option>HCl (15%)</option><option>HCl (28%)</option><option>HF (3%)</option><option>Mud Acid</option></select></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Acid Vol (gal/ft)</label><input type="number" value={acidVolume} onChange={e => setAcidVolume(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Wormhole Eff</label><input type="number" step="0.01" value={wormholeEfficiency} onChange={e => setWormholeEfficiency(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    ['Wormhole Length', `${result.wormholeLength} ft`, '#a78bfa'],
                    ['Skin Reduction', `${result.skinReduction}`, '#06b6d4'],
                    ['Post-Acid Skin', `${result.postAcidSkin}`, '#10b981'],
                    ['Req Volume', `${result.requiredVolumeGal.toLocaleString()} gal`, '#f59e0b']
                ].map(([label, val, color], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black mt-1" style={{ color }}>{val}</div>
                    </div>
                ))}
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-slate-500 text-[10px] font-black uppercase mb-1">Treatment Recommendation</div>
                <div className="text-[10px] text-slate-300 leading-relaxed">{result.recommendation}</div>
            </div>
        </div>
    );
};

// ── Proppant Selection Panel ──
const ProppantSelectionPanel: React.FC = () => {
    const [closureStress, setClosureStress] = useState(7000);
    const [formationD50, setFormationD50] = useState(150);
    const [desiredConductivity, setDesiredConductivity] = useState(40000);
    const [maxTemp, setMaxTemp] = useState(220);
    const [fluidDensity, setFluidDensity] = useState(8.34);

    const inputs: ProppantSelectionInputs = { closureStress, formationD50, desiredConductivity, maxTemp, fluidDensity };
    const result = useMemo(() => selectProppant(inputs), [JSON.stringify(inputs)]);

    const costColor = result.costTier === 'premium' ? '#a78bfa' : result.costTier === 'standard' ? '#06b6d4' : '#10b981';

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Proppant Selection Engine</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Closure Stress (psi)</label><input type="number" value={closureStress} onChange={e => setClosureStress(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Form D50 (μm)</label><input type="number" value={formationD50} onChange={e => setFormationD50(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Target Cond (md-ft)</label><input type="number" value={desiredConductivity} onChange={e => setDesiredConductivity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Max Temp (°F)</label><input type="number" value={maxTemp} onChange={e => setMaxTemp(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[
                    ['Proppant Type', result.proppantType],
                    ['Mesh Size', result.meshSize],
                    ['Max Closure', `${result.maxClosureStress.toLocaleString()} psi`],
                ].map(([label, val], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black text-white mt-1">{val}</div>
                    </div>
                ))}
                <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase">Cost Tier</div>
                    <div className="text-xs font-black mt-1 uppercase" style={{ color: costColor }}>{result.costTier}</div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase">Est. Conductivity</div>
                    <div className="text-xs font-black text-white mt-1">{result.conductivityEstimate.toLocaleString()} md-ft</div>
                </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <div className="text-slate-500 text-[10px] font-black uppercase mb-1">Selection Rationale</div>
                <div className="text-[10px] text-slate-300 leading-relaxed">{result.rationale}</div>
            </div>
        </div>
    );
};

// ── Diversion Design Panel ──
const DiversionPanel: React.FC = () => {
    const [numberOfPerfClusters, setNumberOfPerfClusters] = useState(6);
    const [perfClusterLength, setPerfClusterLength] = useState(2);
    const [stressVariation, setStressVariation] = useState(900);
    const [injectionRate, setInjectionRate] = useState(80);

    const result = useMemo(() => designDiversion(numberOfPerfClusters, perfClusterLength, stressVariation, injectionRate), [numberOfPerfClusters, perfClusterLength, stressVariation, injectionRate]);

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Diversion Design — Limited Entry</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Clusters</label><input type="number" value={numberOfPerfClusters} onChange={e => setNumberOfPerfClusters(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Cluster Len (ft)</label><input type="number" step="0.1" value={perfClusterLength} onChange={e => setPerfClusterLength(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Stress Var (psi)</label><input type="number" value={stressVariation} onChange={e => setStressVariation(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Inj Rate (bpm)</label><input type="number" value={injectionRate} onChange={e => setInjectionRate(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase">Diverter Type</div>
                    <div className="text-[10px] font-black text-white mt-1 leading-tight">{result.diverterType}</div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase">Diverter Stages</div>
                    <div className="text-lg font-black text-cyan-400">{result.diverterStages}</div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-slate-500 text-[10px] font-black uppercase">Efficiency</div>
                    <div className="text-lg font-black text-emerald-400">{(result.diversionEfficiency * 100).toFixed(0)}%</div>
                </div>
            </div>
            {result.diverterSchedule.length > 0 && (
                <table className="w-full text-[11px] border-collapse">
                    <thead>
                        <tr className="text-slate-500 uppercase tracking-widest font-black">
                            <th className="text-left p-1 border-b border-white/5">Stage</th>
                            <th className="text-right p-1 border-b border-white/5">Diverter (lb)</th>
                            <th className="text-right p-1 border-b border-white/5">Carrier (bbl)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.diverterSchedule.map(d => (
                            <tr key={d.stage} className="border-b border-white/5">
                                <td className="p-1 text-white font-bold">{d.stage}</td>
                                <td className="p-1 text-right text-amber-400">{d.diverterLb.toLocaleString()}</td>
                                <td className="p-1 text-right text-slate-400">{d.carrierBbl}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// ── Flowback Prediction Panel ──
const FlowbackPanel: React.FC = () => {
    const [fracLength, setFracLength] = useState(800);
    const [fracConductivity, setFracConductivity] = useState(40000);
    const [formationPerm, setFormationPerm] = useState(0.5);
    const [reservoirPressure, setReservoirPressure] = useState(5500);
    const [flowingPressure, setFlowingPressure] = useState(1500);
    const [porosity, setPorosity] = useState(0.12);
    const [fluidVisc, setFluidVisc] = useState(5);
    const [totalFluidInjected, setTotalFluidInjected] = useState(15000);

    const result = useMemo(() => predictFlowback(fracLength, fracConductivity, formationPerm, reservoirPressure, flowingPressure, porosity, fluidVisc, totalFluidInjected), [fracLength, fracConductivity, formationPerm, reservoirPressure, flowingPressure, porosity, fluidVisc, totalFluidInjected]);

    const foldColor = result.foldOfIncrease > 5 ? '#10b981' : result.foldOfIncrease > 2 ? '#06b6d4' : result.foldOfIncrease > 1 ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Post-Frac Flowback Prediction</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Frac Length (ft)</label><input type="number" value={fracLength} onChange={e => setFracLength(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Frac Cond (md-ft)</label><input type="number" value={fracConductivity} onChange={e => setFracConductivity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Form Perm (mD)</label><input type="number" step="0.01" value={formationPerm} onChange={e => setFormationPerm(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Pres (psi)</label><input type="number" value={reservoirPressure} onChange={e => setReservoirPressure(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Pwf (psi)</label><input type="number" value={flowingPressure} onChange={e => setFlowingPressure(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Porosity</label><input type="number" step="0.01" value={porosity} onChange={e => setPorosity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Fluid Visc (cP)</label><input type="number" value={fluidVisc} onChange={e => setFluidVisc(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Fluid Inj (bbl)</label><input type="number" value={totalFluidInjected} onChange={e => setTotalFluidInjected(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    ['Initial Rate', `${result.initialRateBpd.toLocaleString()} bopd`, '#06b6d4'],
                    ['Fold of Increase', `${result.foldOfIncrease}x`, foldColor],
                    ['Fluid Recovery', `${result.fluidRecoveryDays} days`, '#a78bfa'],
                    ['Recovery Fraction', `${(result.recoveryFraction * 100).toFixed(0)}%`, '#10b981']
                ].map(([label, val, color], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black mt-1" style={{ color }}>{val}</div>
                    </div>
                ))}
            </div>
            <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                <div className="text-[10px] text-slate-300 leading-relaxed">{result.optimizationLabel}</div>
            </div>
        </div>
    );
};

// ── Acid Reaction Kinetics Panel ──
const AcidReactionPanel: React.FC = () => {
    const [acidType, setAcidType] = useState('HCl (15%)');
    const [temperature, setTemperature] = useState(180);
    const [rockType, setRockType] = useState<'limestone' | 'dolomite' | 'sandstone'>('limestone');
    const [acidConcentration, setAcidConcentration] = useState(15);
    const [flowVelocity, setFlowVelocity] = useState(0.05);

    const result = useMemo(() => calculateAcidReaction(acidType, temperature, rockType, acidConcentration, flowVelocity), [acidType, temperature, rockType, acidConcentration, flowVelocity]);

    return (
        <div className="space-y-4">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2">Acid Reaction Kinetics — Arrhenius Model</h3>
            <div className="grid grid-cols-4 gap-3">
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Acid Type</label><select value={acidType} onChange={e => setAcidType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]"><option>HCl (15%)</option><option>HCl (28%)</option><option>Formic Acid (10%)</option><option>Acetic Acid (10%)</option><option>Mud Acid (3% HF)</option><option>HF (3%)</option></select></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Temp (°F)</label><input type="number" value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Rock Type</label><select value={rockType} onChange={e => setRockType(e.target.value as typeof rockType)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]"><option>limestone</option><option>dolomite</option><option>sandstone</option></select></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Acid Conc (wt%)</label><input type="number" value={acidConcentration} onChange={e => setAcidConcentration(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
                <div><label className="text-slate-500 text-[11px] font-black uppercase block mb-1">Flow Vel (ft/sec)</label><input type="number" step="0.001" value={flowVelocity} onChange={e => setFlowVelocity(+e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px]" /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    ['Reaction Rate', `${result.reactionRate.toExponential(3)}/sec`, '#ef4444'],
                    ['Spending Time', `${result.spendingTimeSec} sec`, '#f59e0b'],
                    ['Optimal Contact', `${result.optimalContactMin} min`, '#06b6d4'],
                    ['Spending Distance', `${result.spendingDistanceFt} ft`, '#a78bfa']
                ].map(([label, val, color], i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-slate-500 text-[10px] font-black uppercase">{label}</div>
                        <div className="text-xs font-black mt-1" style={{ color }}>{val}</div>
                    </div>
                ))}
            </div>
            <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
                <div className="text-slate-500 text-[10px] font-black uppercase">Acid Dissolving Capacity</div>
                <div className="text-sm font-black text-amber-400">{result.acidCapacityLbRock} lb rock / gal acid</div>
            </div>
        </div>
    );
};

// ── Main Tab ──
type StimPanel = 'frac' | 'proppant' | 'dfit' | 'acidizing' | 'proppantSelect' | 'diversion' | 'flowback' | 'reaction';

export default function StimulationTab() {
    const [panel, setPanel] = useState<StimPanel>('frac');

    const panels: { id: StimPanel; label: string; emoji: string }[] = [
        { id: 'frac', label: 'Frac Geometry', emoji: '🔺' },
        { id: 'proppant', label: 'Proppant Schedule', emoji: '📊' },
        { id: 'dfit', label: 'DFIT Analysis', emoji: '📉' },
        { id: 'acidizing', label: 'Acidizing', emoji: '🧪' },
        { id: 'proppantSelect', label: 'Proppant Select', emoji: '💎' },
        { id: 'diversion', label: 'Diversion', emoji: '🔄' },
        { id: 'flowback', label: 'Flowback', emoji: '↩️' },
        { id: 'reaction', label: 'Reaction Kinetics', emoji: '⚗️' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {panels.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setPanel(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${panel === p.id ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:border-white/20'}`}
                    >
                        {p.emoji} {p.label}
                    </button>
                ))}
            </div>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                {panel === 'frac' && <FractureGeometryPanel />}
                {panel === 'proppant' && <ProppantSchedulePanel />}
                {panel === 'dfit' && <DFITPanel />}
                {panel === 'acidizing' && <AcidizingPanel />}
                {panel === 'proppantSelect' && <ProppantSelectionPanel />}
                {panel === 'diversion' && <DiversionPanel />}
                {panel === 'flowback' && <FlowbackPanel />}
                {panel === 'reaction' && <AcidReactionPanel />}
            </div>
        </div>
    );
}