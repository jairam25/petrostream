import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Waves,
    Calculator,
    Droplet,
    Layers,
    Zap,
    Target,
    Activity,
    LineChart,
    Settings2,
    Database,
    Search,
    FileText
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import {
    LOGGING_TOOLS,
    calculateIGR,
    calculateVshGR,
    calculateDensityPorosity,
    calculateSonicPorosityWyllie,
    calculateSonicPorosityRHG,
    calculateNDCrossplotPorosity,
    calculateArchieSw,
    calculateIndonesianSw,
    calculateSimandouxSw,
    calculateDualWaterSw,
    calculateWaxmanSmitsSw,
    calculateTimurPermeability,
    calculateCoatesPermeability,
    calculateTixierPermeability,
    calculateWinlandR35,
    calculateNetPayStats
} from '../../lib/petrophysics';
import {
    LineChart as RechartLine,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ReferenceLine,
    Cell,
    BarChart,
    Bar
} from 'recharts';

export function WellLogAnalysisModule() {
    const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

    // Phase 1: Basic Logs State
    const [selectedTool, setSelectedTool] = useState(LOGGING_TOOLS[0]);

    // Phase 2: Porosity State
    const [porosityInp, setPorosityInp] = useState({
        rhob: 2.35,
        rhoMa: 2.65,
        rhoFl: 1.0,
        dt: 75,
        dtMa: 55.5,
        dtFl: 189,
        nphi: 0.25,
        matrix: 'sandstone' as 'sandstone' | 'limestone' | 'dolomite'
    });

    // Phase 3: Saturation State
    const [satInp, setSatInp] = useState({
        rw: 0.05,
        rt: 20,
        phi: 0.22,
        a: 1.0,
        m: 2.0,
        n: 2.0,
        vsh: 0.15,
        rsh: 2.0,
        rwb: 0.1,
        nphi_sh: 0.45,
        qv: 0.1,
        b_ws: 3.8
    });

    // Phase 4: Lithology State
    const [lithInp, setLithInp] = useState({
        gr: 85,
        grClean: 20,
        grShale: 120,
        sp: -45,
        spBase: 0,
        spMax: -60,
        nphi: 0.28,
        dphi: 0.18,
        nphiSh: 0.45,
        dphiSh: 0.05
    });

    // Phase 5: Permeability State
    const [permInp, setPermInp] = useState({
        phi: 0.22,
        swi: 0.25,
        k: 150
    });

    // Phase 6: Cutoffs State
    const [cutoffs, setCutoffs] = useState({
        minPhi: 0.1,
        maxVsh: 0.4,
        maxSw: 0.6,
        minK: 1.0
    });

    // Calculations
    const phis = useMemo(() => ({
        density: calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMa, porosityInp.rhoFl),
        sonicWyllie: calculateSonicPorosityWyllie(porosityInp.dt, porosityInp.dtMa, porosityInp.dtFl),
        sonicRHG: calculateSonicPorosityRHG(porosityInp.dt, porosityInp.dtMa),
        nd: calculateNDCrossplotPorosity(porosityInp.nphi, calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMa, porosityInp.rhoFl))
    }), [porosityInp]);

    const sats = useMemo(() => ({
        archie: calculateArchieSw(satInp.a, satInp.rw, satInp.phi, satInp.m, satInp.rt, satInp.n),
        indonesian: calculateIndonesianSw(satInp.vsh, satInp.rsh, satInp.phi, satInp.rw, satInp.rt, satInp.a, satInp.m, satInp.n),
        simandoux: calculateSimandouxSw(satInp.vsh, satInp.rsh, satInp.phi, satInp.rw, satInp.rt, satInp.a, satInp.m, satInp.n),
        dualWater: calculateDualWaterSw(satInp.phi, satInp.vsh, satInp.nphi_sh, satInp.rw, satInp.rwb, satInp.rt, satInp.m, satInp.n),
        waxmanSmits: calculateWaxmanSmitsSw(satInp.phi, satInp.rw, satInp.rt, satInp.m, satInp.n, satInp.qv, satInp.b_ws)
    }), [satInp]);

    const vshales = useMemo(() => ({
        linear: calculateIGR(lithInp.gr, lithInp.grClean, lithInp.grShale),
        steiber: calculateVshGR(lithInp.gr, lithInp.grClean, lithInp.grShale, 'steiber'),
        clavier: calculateVshGR(lithInp.gr, lithInp.grClean, lithInp.grShale, 'clavier'),
        nd: (lithInp.nphi - lithInp.dphi) / (lithInp.nphiSh - lithInp.dphiSh)
    }), [lithInp]);

    const perms = useMemo(() => ({
        timur: calculateTimurPermeability(permInp.phi, permInp.swi),
        coates: calculateCoatesPermeability(permInp.phi, permInp.swi),
        tixier: calculateTixierPermeability(permInp.phi, permInp.swi),
        winland: calculateWinlandR35(permInp.k, permInp.phi)
    }), [permInp]);

    // Computed Net Pay from user's porosity/saturation/vshale + cutoff settings
    const netPay = useMemo(() => {
        const selectedPhi = phis.density;
        const selectedSw = sats.archie;
        const selectedVsh = vshales.linear;
        const k = perms.timur;
        const syntheticLog: { depth: number; phi: number; vsh: number; sw: number; k: number }[] = [];
        const nPts = 50;
        const dz = 5; // ft
        for (let i = 0; i < nPts; i++) {
            const depth = 5200 + i * dz;
            const jitter = () => (Math.random() - 0.5) * 0.04;
            syntheticLog.push({
                depth,
                phi: Math.max(0, Math.min(0.45, selectedPhi + jitter())),
                vsh: Math.max(0, Math.min(1, selectedVsh + jitter())),
                sw: Math.max(0.01, Math.min(1, selectedSw + jitter())),
                k: Math.max(0.01, k * (0.5 + Math.random()))
            });
        }
        return calculateNetPayStats(syntheticLog, cutoffs);
    }, [phis, sats, vshales, perms, cutoffs]);

    const phases = [
        { id: 1, name: 'Basic Logs', icon: Waves },
        { id: 2, name: 'Porosity Systems', icon: Calculator },
        { id: 3, name: 'Water Saturation', icon: Droplet },
        { id: 4, name: 'Lithology & Clay', icon: Layers },
        { id: 5, name: 'Permeability', icon: Zap },
        { id: 6, name: 'Cutoff & Net Pay', icon: Target }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Module Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Activity className="text-emerald-500" size={32} />
                        Well Log Analysis <span className="text-emerald-500/50">Module 3</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Comprehensive Petrophysical Interpretation & Formation Evaluation Engine</p>
                </div>
                <div className="flex gap-2">
                    {phases.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePhase(p.id as any)}
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                activePhase === p.id
                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    : "bg-white/5 text-slate-500 border-white/5 hover:text-white"
                            )}
                            title={p.name}
                        >
                            <p.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Phase Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Phase Specific Controls and Visuals */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePhase}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 min-h-[600px] flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    {React.createElement(phases[activePhase - 1].icon, { size: 24 })}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic">Phase {activePhase}: {phases[activePhase - 1].name}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Petrophysics Workflow Step</p>
                                </div>
                            </div>

                            {activePhase === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search Log Types (GR, SP, NPHI...)"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {LOGGING_TOOLS.map(tool => (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => setSelectedTool(tool)}
                                                    className={cn(
                                                        "p-4 rounded-2xl text-left border transition-all",
                                                        selectedTool.id === tool.id
                                                            ? "bg-emerald-500 text-white border-emerald-400"
                                                            : "bg-white/5 text-slate-500 border-white/5 hover:text-white"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-black italic">{tool.acronym}</span>
                                                        <span className="text-[10px] uppercase tracking-widest opacity-60">{tool.category}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold">{tool.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="glass-card bg-emerald-500/5 rounded-3xl p-6 border-white/5 space-y-6">
                                        <div className="pb-4 border-b border-white/10">
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Technical Specifications</h4>
                                            <p className="text-lg font-bold text-white leading-tight">{selectedTool.name} ({selectedTool.acronym})</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                                            <div>
                                                <p className="text-slate-500 uppercase mb-1">DOI</p>
                                                <p className="text-white font-mono">{selectedTool.depthOfInvestigation}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 uppercase mb-1">Vert. Resolution</p>
                                                <p className="text-white font-mono">{selectedTool.verticalResolution}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[11px] text-slate-400 leading-relaxed italic">"{selectedTool.description}"</p>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                                <p className="text-[11px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Lithology Response</p>
                                                <div className="space-y-2 text-[10px]">
                                                    <div className="flex justify-between font-mono">
                                                        <span className="text-amber-400">Sandstone</span>
                                                        <span className="text-slate-300">{selectedTool.lithologyResponse.sandstone}</span>
                                                    </div>
                                                    <div className="flex justify-between font-mono">
                                                        <span className="text-indigo-400">Limestone</span>
                                                        <span className="text-slate-300">{selectedTool.lithologyResponse.limestone}</span>
                                                    </div>
                                                    <div className="flex justify-between font-mono">
                                                        <span className="text-emerald-400">Shale</span>
                                                        <span className="text-slate-300">{selectedTool.lithologyResponse.shale}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePhase === 2 && (
                                <div className="space-y-8 flex-grow">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <PhaseCard label="FDC (Density)" value={formatNumber(phis.density * 100, 1)} unit="%" icon={Database} color="text-amber-400" />
                                        <PhaseCard label="CNL (Neutron)" value={formatNumber(porosityInp.nphi * 100, 1)} unit="%" icon={Droplet} color="text-indigo-400" />
                                        <PhaseCard label="Sonic Wyllie" value={formatNumber(phis.sonicWyllie * 100, 1)} unit="%" icon={Waves} color="text-emerald-400" />
                                        <PhaseCard label="N-D Crossplot" value={formatNumber(phis.nd * 100, 1)} unit="%" icon={Calculator} color="text-white" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="glass-card bg-black/40 rounded-2xl p-8 border-white/5">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Crossplot Visualization</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                                        <XAxis type="number" dataKey="nphi" name="NPHI" unit=" v/v" stroke="#64748b" fontSize={10} domain={[0, 0.45]} reversed />
                                                        <YAxis type="number" dataKey="rhob" name="RHOB" unit=" g/cc" stroke="#64748b" fontSize={10} domain={[2.0, 3.0]} reversed />
                                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                                        <ReferenceLine x={0.18} stroke="#ffffff10" />
                                                        <Scatter name="Measurement" data={[{ nphi: porosityInp.nphi, rhob: porosityInp.rhob }]} fill="#10b981" shape="star" />
                                                        {/* Typical matrix lines could go here */}
                                                    </ScatterChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 flex justify-between text-[11px] font-mono text-slate-600">
                                                <span>NPHI {porosityInp.nphi}</span>
                                                <span>RHOB {porosityInp.rhob} g/cc</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <p className="text-[10px] font-black text-white uppercase mb-4 tracking-widest">Wyllie Time-Average Parameters</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] text-slate-500 uppercase">Delta-T Log</label>
                                                        <input type="number" value={porosityInp.dt} onChange={e => setPorosityInp({ ...porosityInp, dt: Number(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-xs text-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] text-slate-500 uppercase">Matrix Delta-T</label>
                                                        <input type="number" value={porosityInp.dtMa} onChange={e => setPorosityInp({ ...porosityInp, dtMa: Number(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-xs text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                                                <p className="text-[11px] text-white font-bold leading-tight">Porosity determination follows the mass balance relationship where total measured bulk density or transit time is the weighted average of matrix and fluid fractions.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePhase === 3 && (
                                <div className="space-y-8 flex-grow text-white">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <SatResultCard label="Archie" value={sats.archie} />
                                        <SatResultCard label="Indonesian" value={sats.indonesian} />
                                        <SatResultCard label="Simandoux" value={sats.simandoux} />
                                        <SatResultCard label="Dual Water" value={sats.dualWater} />
                                        <SatResultCard label="Waxman-Smits" value={sats.waxmanSmits} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-1 space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Physics Controls</h4>
                                            <div className="space-y-6">
                                                <PetroSlider label="Rw (Ohm-m)" value={satInp.rw} min={0.01} max={0.5} step={0.01} onChange={v => setSatInp({ ...satInp, rw: v })} />
                                                <PetroSlider label="Resistivity Rt" value={satInp.rt} min={0.1} max={100} step={0.1} onChange={v => setSatInp({ ...satInp, rt: v })} />
                                                <PetroSlider label="Porosity phi" value={satInp.phi} min={0.05} max={0.35} step={0.01} onChange={v => setSatInp({ ...satInp, phi: v })} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 glass-card bg-black/40 rounded-2xl p-8 border-white/5">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Pickett Plot Analogy (Conductivity vs Porosity)</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                                        <XAxis type="number" dataKey="phi" name="Porosity" unit="" stroke="#64748b" fontSize={10} domain={[0.01, 0.4]} scale="log" />
                                                        <YAxis type="number" dataKey="rt" name="Rt" unit="" stroke="#64748b" fontSize={10} domain={[0.1, 1000]} scale="log" />
                                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                                                        <Scatter name="Formation Point" data={[{ phi: satInp.phi, rt: satInp.rt }]} fill="#34d399" />
                                                        {/* Ro line could be plotted here */}
                                                    </ScatterChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 flex justify-center gap-8 text-[11px] font-mono text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span>Hydrocarbon Potential</span>
                                                </div>
                                                <span>Phi-m Slope = -{satInp.m}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePhase === 4 && (
                                <div className="space-y-8 flex-grow">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <PhaseCard label="Vsh (Linear)" value={formatNumber(vshales.linear * 100, 1)} unit="%" icon={Layers} color="text-slate-400" />
                                        <PhaseCard label="Vsh (Steiber)" value={formatNumber(vshales.steiber * 100, 1)} unit="%" icon={Layers} color="text-amber-400" />
                                        <PhaseCard label="Vsh (N-D)" value={formatNumber(vshales.nd * 100, 1)} unit="%" icon={Zap} color="text-indigo-400" />
                                        <PhaseCard label="SP Rel. Defl." value={formatNumber((lithInp.sp / lithInp.spMax) * 100, 1)} unit="%" icon={Activity} color="text-red-400" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="glass-card bg-black/40 rounded-2xl p-8 border-white/5">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Vshale Model Comparison</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[
                                                        { name: 'Linear', vsh: vshales.linear },
                                                        { name: 'Steiber', vsh: vshales.steiber },
                                                        { name: 'Clavier', vsh: vshales.clavier },
                                                        { name: 'N-D', vsh: vshales.nd }
                                                    ]}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                                                        <YAxis stroke="#64748b" fontSize={10} domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                                                        <Bar dataKey="vsh" radius={[12, 12, 0, 0]}>
                                                            {Array.from({ length: 4 }).map((_, i) => (
                                                                <Cell key={`cell-${i}`} fill={i === 0 ? '#64748b' : i === 1 ? '#f59e0b' : i === 2 ? '#3b82f6' : '#818cf8'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <p className="text-[10px] font-black text-white uppercase mb-4 tracking-widest">Gamma Ray Calibration</p>
                                                <div className="space-y-4">
                                                    <PetroSlider label="GR Clean (API)" value={lithInp.grClean} min={0} max={100} step={5} onChange={v => setLithInp({ ...lithInp, grClean: v })} />
                                                    <PetroSlider label="GR Shale (API)" value={lithInp.grShale} min={70} max={250} step={5} onChange={v => setLithInp({ ...lithInp, grShale: v })} />
                                                    <PetroSlider label="Current GR" value={lithInp.gr} min={0} max={250} step={1} onChange={v => setLithInp({ ...lithInp, gr: v })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePhase === 5 && (
                                <div className="space-y-8 flex-grow">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <PhaseCard label="Timur k" value={formatNumber(perms.timur, 1)} unit="mD" icon={Zap} color="text-amber-400" />
                                        <PhaseCard label="Coates k" value={formatNumber(perms.coates, 1)} unit="mD" icon={Zap} color="text-emerald-400" />
                                        <PhaseCard label="Tixier k" value={formatNumber(perms.tixier, 1)} unit="mD" icon={Zap} color="text-indigo-400" />
                                        <PhaseCard label="Winland R35" value={formatNumber(perms.winland, 2)} unit="μm" icon={Activity} color="text-white" />
                                    </div>
                                    <div className="glass-card bg-black/40 rounded-3xl p-10 border-white/5">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                            <div className="space-y-6 md:w-1/3">
                                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Model Sensitivity</h4>
                                                <PetroSlider label="Porosity (phi)" value={permInp.phi} min={0.05} max={0.35} step={0.01} onChange={v => setPermInp({ ...permInp, phi: v })} />
                                                <PetroSlider label="Swir (fraction)" value={permInp.swi} min={0.05} max={0.5} step={0.01} onChange={v => setPermInp({ ...permInp, swi: v })} />
                                            </div>
                                            <div className="grow space-y-4">
                                                <p className="text-[11px] text-slate-400 leading-relaxed italic">Permeability correlations from logs are strictly empirical and require core calibration. The models shown here assume a clean-sand framework with standard constants A and B.</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px]">
                                                        <p className="text-slate-500 uppercase mb-2">Timur constant</p>
                                                        <p className="text-white font-mono">0.136 * (phi^4.4 / swi^2)</p>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px]">
                                                        <p className="text-slate-500 uppercase mb-2">Pore Throat Class</p>
                                                        <p className="text-amber-400 font-bold uppercase">{perms.winland > 10 ? 'Mega' : perms.winland > 2 ? 'Macro' : perms.winland > 0.5 ? 'Meso' : 'Micro'}porous</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePhase === 6 && (
                                <div className="space-y-8 flex-grow">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="glass-card bg-black/80 rounded-3xl p-6 border-white/10 ring-2 ring-emerald-500/20">
                                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Net-to-Gross</p>
                                            <p className="text-3xl font-black text-white italic">{formatNumber(netPay.ntg, 2)}<span className="text-xs text-emerald-500 ml-1">NTG</span></p>
                                        </div>
                                        <div className="glass-card bg-black/80 rounded-3xl p-6 border-white/10">
                                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Net Pay Thickness</p>
                                            <p className="text-3xl font-black text-white italic">{formatNumber(netPay.netPayThickness, 0)}<span className="text-xs text-emerald-500 ml-1">ft</span></p>
                                        </div>
                                        <div className="glass-card bg-black/80 rounded-3xl p-6 border-white/10">
                                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Avg Porosity</p>
                                            <p className="text-3xl font-black text-white italic">{formatNumber(netPay.avgPhi * 100, 1)}<span className="text-xs text-emerald-500 ml-1">%</span></p>
                                        </div>
                                        <div className="glass-card bg-black/80 rounded-3xl p-6 border-white/10">
                                            <p className="text-[11px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Avg Water Sat</p>
                                            <p className="text-3xl font-black text-white italic">{formatNumber(netPay.avgSw * 100, 1)}<span className="text-xs text-emerald-500 ml-1">%</span></p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-1 space-y-6">
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cutoff Parameters</h4>
                                            <div className="space-y-4">
                                                <PetroSlider label="Min Porosity (%)" value={cutoffs.minPhi * 100} min={5} max={25} step={1} onChange={v => setCutoffs({ ...cutoffs, minPhi: v / 100 })} />
                                                <PetroSlider label="Max Shale (%)" value={cutoffs.maxVsh * 100} min={10} max={60} step={1} onChange={v => setCutoffs({ ...cutoffs, maxVsh: v / 100 })} />
                                                <PetroSlider label="Max Sw (%)" value={cutoffs.maxSw * 100} min={30} max={80} step={1} onChange={v => setCutoffs({ ...cutoffs, maxSw: v / 100 })} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 glass-card bg-black/40 rounded-2xl p-8 border-white/5 relative overflow-hidden">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">PAY FLAG</div>
                                                <div className="px-2 py-0.5 bg-slate-500/20 text-slate-500 text-[10px] font-bold rounded">NON-PAY</div>
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 font-mono">Stratigraphic Pay Profile</h4>
                                            <div className="h-64 flex items-end gap-1 px-4">
                                                {Array.from({ length: 40 }).map((_, i) => {
                                                    const isPay = Math.random() > 0.3;
                                                    const height = 40 + Math.random() * 60;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "grow transition-all duration-500 rounded-t-sm",
                                                                isPay ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-800 opacity-30"
                                                            )}
                                                            style={{ height: `${height}%` }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] font-mono text-slate-600">
                                                <span>INTERVAL: 5200 - 5450 ft</span>
                                                <span>SAMPLE RATE: 0.5 ft</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Column: Reference & Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FileText size={16} className="text-emerald-500" />
                            Physics Formulation
                        </h4>
                        <div className="p-6 bg-black/60 rounded-3xl border border-white/5 font-serif text-lg text-emerald-400 italic text-center">
                            {activePhase === 2 && "Φ = (ρma - ρb) / (ρma - ρfl)"}
                            {activePhase === 3 && "Sw^n = (a * Rw) / (Φ^m * Rt)"}
                            {activePhase === 4 && "IGR = (GR - GR_clean) / (GR_shale - GR_clean)"}
                            {activePhase === 5 && "k = 0.136 * (Φ^4.4 / Swir^2)"}
                            {activePhase === 1 && "I = q / (pr - pwf)"}
                            {activePhase === 6 && "Net Pay = Σ (isPay_i * Δz_i)"}
                        </div>
                        <div className="mt-6 space-y-4">
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Standard interpretation workflow assumes clean matrix properties for quartz or calcite unless multimineral inversion is applied.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl text-[11px] font-mono">
                                    <span className="text-slate-500 block mb-1">CEMENT EXP. (m)</span>
                                    <span className="text-white font-bold">2.0 (Sandstone)</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-[11px] font-mono">
                                    <span className="text-slate-500 block mb-1">SATURATION (n)</span>
                                    <span className="text-white font-bold">2.0 (Water-wet)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <LineChart size={16} className="text-emerald-500" />
                            Appraisal Dashboard
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Analysis</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">SESSION_A</span>
                            </div>
                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Quick Calc: Shale Corrected Phi</p>
                                <p className="text-3xl font-black text-white">{formatNumber(phis.density - (vshales.linear * 0.12), 3)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PhaseCard({ label, value, unit, icon: Icon, color }: { label: string, value: string, unit: string, icon: any, color: string }) {
    return (
        <div className="glass-card bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                    <Icon size={16} />
                </div>
                <span className="text-[10px] font-mono text-slate-600 uppercase">calculated</span>
            </div>
            <p className="text-2xl font-black text-white italic tracking-tighter">{value}<span className="text-[10px] font-normal text-slate-500 ml-1 not-italic uppercase tracking-normal">{unit}</span></p>
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mt-1">{label}</p>
        </div>
    );
}

function PetroSlider({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-[11px] text-slate-500 uppercase font-black tracking-widest">{label}</label>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}

function SatResultCard({ label, value }: { label: string, value: number }) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest truncate">{label}</p>
            <p className="text-xl font-black text-white italic">{(value * 100).toFixed(1)}%</p>
        </div>
    );
}
