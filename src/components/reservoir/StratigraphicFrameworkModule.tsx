import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
    GitBranch,
    SlidersHorizontal,
    Box,
    Crosshair,
    Palette,
    Map,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    ComposedChart,
    ReferenceLine,
    BarChart,
    Bar,
    Cell,
} from 'recharts';

interface WellLog {
    id: string;
    md: number[];
    gr: number[];
    dt: number[];
    rhob: number[];
    nphi: number[];
    rt: number[];
}

const SAMPLE_WELLS: WellLog[] = [
    { id: 'A-01', md: [2000, 2020, 2040, 2060, 2080, 2100, 2120, 2140, 2160, 2180, 2200], gr: [45, 52, 38, 60, 120, 95, 42, 55, 40, 48, 58], dt: [65, 68, 70, 75, 95, 85, 72, 67, 71, 69, 73], rhob: [2.35, 2.30, 2.28, 2.22, 2.10, 2.18, 2.32, 2.25, 2.20, 2.28, 2.35], nphi: [0.22, 0.24, 0.26, 0.30, 0.35, 0.32, 0.25, 0.28, 0.31, 0.26, 0.23], rt: [8, 12, 15, 25, 40, 35, 10, 14, 20, 16, 11] },
    { id: 'A-02', md: [1950, 1970, 1990, 2010, 2030, 2050, 2070, 2090, 2110, 2130, 2150], gr: [50, 55, 40, 65, 110, 100, 38, 48, 42, 52, 56], dt: [62, 66, 71, 78, 92, 88, 68, 65, 70, 67, 75], rhob: [2.38, 2.32, 2.26, 2.20, 2.08, 2.15, 2.34, 2.28, 2.22, 2.26, 2.32], nphi: [0.20, 0.23, 0.27, 0.32, 0.36, 0.33, 0.24, 0.26, 0.30, 0.27, 0.24], rt: [10, 14, 18, 28, 45, 38, 12, 16, 22, 18, 13] },
    { id: 'A-03', md: [2100, 2120, 2140, 2160, 2180, 2200, 2220, 2240, 2260, 2280, 2300], gr: [42, 48, 35, 58, 105, 90, 44, 50, 38, 46, 55], dt: [68, 70, 73, 80, 98, 90, 70, 66, 74, 72, 76], rhob: [2.33, 2.28, 2.25, 2.18, 2.05, 2.12, 2.30, 2.24, 2.19, 2.27, 2.33], nphi: [0.23, 0.25, 0.28, 0.33, 0.38, 0.34, 0.26, 0.29, 0.32, 0.28, 0.25], rt: [9, 13, 16, 26, 42, 36, 11, 15, 21, 17, 12] },
];

type Phase = 'sequence' | 'depositional' | 'facies' | 'correlation';

interface SequenceSurface { surface: 'fs' | 'sb' | 'mfs'; depth: number; }
interface LayerInfo { type: string; baseDepth: number; thickness: number; }

function detectSequenceSurfaces(md: number[], gr: number[]): { surfaces: SequenceSurface[]; layers: LayerInfo[]; nSequences: number; systemTracts: string[] } {
    const surfaces: SequenceSurface[] = [];
    const layers: LayerInfo[] = [];
    const nPts = Math.min(md.length, gr.length);
    // Detect GR shifts (cleaning = FS, sharp increase = SB)
    for (let i = 1; i < nPts - 1; i++) {
        const deltaGR = gr[i] - gr[i - 1];
        const nextDeltaGR = gr[i + 1] - gr[i];
        if (deltaGR < -20 && Math.abs(nextDeltaGR) < 10) {
            surfaces.push({ surface: 'fs', depth: md[i] });
        } else if (deltaGR > 25 && nextDeltaGR < 0) {
            surfaces.push({ surface: 'mfs', depth: md[i] });
        } else if (deltaGR > 40) {
            surfaces.push({ surface: 'sb', depth: md[i] });
        }
    }
    // Generate layers between surfaces
    const allSurfaces = [...surfaces].sort((a, b) => a.depth - b.depth);
    const topDepth = md[0];
    const bottomDepth = md[nPts - 1];
    let prevDepth = topDepth;
    for (const s of allSurfaces) {
        layers.push({ type: s.surface, baseDepth: prevDepth, thickness: s.depth - prevDepth });
        prevDepth = s.depth;
    }
    layers.push({ type: 'hst', baseDepth: prevDepth, thickness: bottomDepth - prevDepth });
    const uniqueSequences = surfaces.filter(s => s.surface === 'sb').length;
    return { surfaces, layers, nSequences: Math.max(1, uniqueSequences), systemTracts: ['LST', 'TST', 'HST'] };
}

function buildDepositionalProfile(params: { waterDepth: number; sedimentSupply: number; subsidenceRate: number; seaLevel: number }, nPoints: number) {
    const profile: { distance: number; elevation: number }[] = [];
    const types = ['channel', 'bar', 'shoreface', 'turbidite-lobe', 'deltaic'] as const;
    const type = types[Math.floor((params.waterDepth / 500) * types.length) % types.length];
    const width = params.sedimentSupply * 0.02 + 200;
    const thickness = params.waterDepth * 0.08 + 5;
    const sinuosity = 1.0 + (params.subsidenceRate * 80);
    const orientation = 30 + (params.waterDepth % 60);
    const netGross = Math.max(0.3, Math.min(0.95, 1 - params.subsidenceRate * 0.6));
    const depoElements: Record<string, number> = {
        'Channel Fill': 0.15 + Math.random() * 0.1,
        'Levee': 0.08 + Math.random() * 0.05,
        'Crevasse Splay': 0.05 + Math.random() * 0.05,
        'Floodplain': 0.15 + Math.random() * 0.1,
        'Overbank': 0.1 + Math.random() * 0.08,
        'Background': 0.2 + Math.random() * 0.1,
    };
    // Normalize
    const total = Object.values(depoElements).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(depoElements)) depoElements[k] /= total;

    for (let i = 0; i < nPoints; i++) {
        const dist = i * 100;
        const baseDepth = params.waterDepth + params.subsidenceRate * dist * 0.1;
        const sedElev = -baseDepth * 0.3 * Math.sin(dist * 0.01 + params.seaLevel * 0.02);
        profile.push({ distance: dist, elevation: sedElev - baseDepth });
    }
    return { type, profile, bodyWidth: width, bodyThickness: thickness, sinuosity, orientation, netGross, depoElements };
}

function classifyFacies(grValues: number[], dtValues: number[], rhobValues: number[], nphiValues: number[]) {
    const n = grValues.length;
    const facies: string[] = [];
    const counts: Record<string, number> = {};
    const faciesList: { facies: string; percent: number }[] = [];

    for (let i = 0; i < n; i++) {
        const gr = grValues[i];
        const dt = dtValues[i];
        const rhob = rhobValues[i];
        const nphi = nphiValues[i];
        if (gr < 45 && dt < 70 && rhob > 2.28 && nphi < 0.26) facies.push('Channel Sandstone');
        else if (gr < 65 && dt < 78 && rhob > 2.22) facies.push('Crevasse Splay');
        else if (gr > 80 && dt > 85) facies.push('Marine Shale');
        else if (gr > 100 && dt > 90 && rhob < 2.15) facies.push('Organic-Rich Mudstone');
        else if (gr < 55 && dt >= 70 && dt < 80 && rhob >= 2.25 && rhob < 2.30) facies.push('Carbonate Stringer');
        else facies.push('Heterolithic');
    }
    for (const f of facies) counts[f] = (counts[f] || 0) + 1;
    for (const [faciesName, count] of Object.entries(counts)) {
        faciesList.push({ facies: faciesName, percent: (count / n) * 100 });
    }
    faciesList.sort((a, b) => b.percent - a.percent);
    const cutoffs = faciesList.map(f => ({
        facies: f.facies,
        criteria: f.facies.includes('Sandstone') ? 'GR<45, RHOB>2.28, NPHI<0.26' :
            f.facies.includes('Splay') ? 'GR<65, DT<78, RHOB>2.22' :
                f.facies.includes('Shale') ? 'GR>80, DT>85' :
                    f.facies.includes('Mudstone') ? 'GR>100, DT>90, RHOB<2.15' :
                        f.facies.includes('Carbonate') ? 'GR<55, DT 70-80, RHOB 2.25-2.30' : 'Other',
    }));
    return { method: 'GR-DT-RHOB-NPHI Cutoff', distribution: faciesList, cutoffs };
}

function generateCorrelation(wells: WellLog[]) {
    const panels: { wells: string[]; correlationPoints: { depths: number[] }[] }[] = [];
    for (let i = 0; i < wells.length - 1; i++) {
        const w1 = wells[i];
        const w2 = wells[i + 1];
        const nPts = Math.min(w1.md.length, w2.md.length);
        const points: { depths: number[] }[] = [];
        for (let j = 0; j < nPts; j++) {
            points.push({ depths: [w1.md[j], w2.md[j]] });
        }
        panels.push({ wells: [w1.id, w2.id], correlationPoints: points });
    }
    const maxThrow = Math.max(...wells.map(w => Math.max(...w.md) - Math.min(...w.md)));
    const avgSpacing = wells.length > 1
        ? wells.slice(1).reduce((s, w, i) => s + (w.md[0] - wells[i].md[0]), 0) / (wells.length - 1)
        : 0;
    return {
        panels,
        statistics: {
            maxThrow,
            averageWellSpacing: Math.abs(avgSpacing),
            dipAngleDeg: Math.abs(avgSpacing) > 0 ? Math.atan(maxThrow / Math.abs(avgSpacing)) * (180 / Math.PI) : 3.5,
            strikeDirectionDeg: 45,
            nSurfaces: 8,
        },
    };
}

export function StratigraphicFrameworkModule() {
    const [phase, setPhase] = useState<Phase>('sequence');
    const [selectedWell, setSelectedWell] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [depParams, setDepParams] = useState({
        waterDepth: 120,
        sedimentSupply: 800,
        subsidenceRate: 0.05,
        seaLevel: 0,
    });

    const sequences = useMemo(() => {
        return detectSequenceSurfaces(SAMPLE_WELLS[selectedWell].md, SAMPLE_WELLS[selectedWell].gr);
    }, [selectedWell]);

    const depModel = useMemo(() => {
        return buildDepositionalProfile(depParams, 20);
    }, [depParams]);

    const faciesClass = useMemo(() => {
        const well = SAMPLE_WELLS[selectedWell];
        return classifyFacies(well.gr, well.dt, well.rhob, well.nphi);
    }, [selectedWell]);

    const correlation = useMemo(() => {
        return generateCorrelation(SAMPLE_WELLS);
    }, []);

    const phases = [
        { id: 'sequence' as Phase, name: 'Sequence Stratigraphy', icon: GitBranch },
        { id: 'depositional' as Phase, name: 'Depositional Model', icon: Map },
        { id: 'facies' as Phase, name: 'Facies Scheme', icon: Palette },
        { id: 'correlation' as Phase, name: 'Well Correlation', icon: Crosshair },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Box className="text-emerald-500" size={28} />
                        Stratigraphic & Sedimentological Framework
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Sub-Step 2.5.2 — Sequence, Depositional, Facies, Correlation</p>
                </div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn(
                        "px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
                        showAdvanced ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    )}
                >
                    <SlidersHorizontal size={12} /> Parameters
                </button>
            </div>

            <div className="flex gap-3 flex-wrap">
                {phases.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setPhase(p.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                            phase === p.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                    >
                        <p.icon size={14} /> {p.name}
                    </button>
                ))}
            </div>

            {/* SEQUENCE STRATIGRAPHY */}
            {phase === 'sequence' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Sequence Stratigraphic Column — Well {SAMPLE_WELLS[selectedWell].id}</h4>
                        <p className="text-slate-500 text-xs mb-4">Key surfaces: FS (Flooding Surface), SB (Sequence Boundary), MFS (Maximum Flooding Surface)</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={sequences.layers.map((l, i) => ({
                                    name: l.type.toUpperCase() + ' ' + (i + 1),
                                    depth: l.baseDepth,
                                }))}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 10 }} reversed />
                                <YAxis type="category" dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                <Bar dataKey="depth" barSize={20} radius={[0, 4, 4, 0]}>
                                    {sequences.layers.map((l, i) => (
                                        <Cell
                                            key={i}
                                            fill={l.type === 'fs' ? '#06b6d4' : l.type === 'sb' ? '#f59e0b' : l.type === 'mfs' ? '#22c55e' : '#6366f1'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3">Well Selector</h4>
                            {SAMPLE_WELLS.map((w, i) => (
                                <button key={w.id} onClick={() => setSelectedWell(i)} className={cn("w-full text-left px-3 py-2 rounded-lg mb-2 text-xs font-mono", selectedWell === i ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>
                                    Well {w.id} — {w.md.length} log points
                                </button>
                            ))}
                        </div>
                        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3">Sequence Summary</h4>
                            <p className="text-xs text-slate-400">Total sequences detected: <span className="text-cyan-400 font-bold">{sequences.nSequences}</span></p>
                            <p className="text-xs text-slate-400 mt-1">System tracts identified: <span className="text-amber-400 font-bold">{sequences.systemTracts.length}</span></p>
                            {sequences.surfaces.map((s, i) => (
                                <div key={i} className="flex justify-between mt-2 text-[10px]">
                                    <span className={s.surface === 'mfs' ? 'text-green-400' : s.surface === 'sb' ? 'text-amber-400' : 'text-cyan-400'}>{s.surface.toUpperCase()}</span>
                                    <span className="text-slate-500">{s.depth.toFixed(0)} ft</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* DEPOSITIONAL MODEL */}
            {phase === 'depositional' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {showAdvanced && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            {[
                                { label: 'Water Depth (m)', key: 'waterDepth', min: 10, max: 500, step: 10 },
                                { label: 'Sediment Supply (m³/ka)', key: 'sedimentSupply', min: 100, max: 5000, step: 100 },
                                { label: 'Subsidence (mm/yr)', key: 'subsidenceRate', min: 0.01, max: 1, step: 0.01 },
                                { label: 'Sea Level (m)', key: 'seaLevel', min: -100, max: 100, step: 5 },
                            ].map(p => (
                                <div key={p.key}>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">{p.label}</label>
                                    <input type="number" value={(depParams as any)[p.key]} onChange={e => setDepParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs mt-1" step={p.step} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-2">Depositional Profile — {depModel.type}</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={depModel.profile}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="distance" stroke="#ffffff40" label={{ value: 'Distance (m)', position: 'bottom', fill: '#ffffff40' }} />
                                    <YAxis stroke="#ffffff40" label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#ffffff40' }} reversed />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                    <Area type="monotone" dataKey="elevation" fill="#06b6d422" stroke="#06b6d4" strokeWidth={2} />
                                    <ReferenceLine y={depParams.seaLevel} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Sea Level', fill: '#f59e0b', fontSize: 10 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3">Model Properties</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Depo. Type</span><span className="text-emerald-400 font-bold">{depModel.type}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Body Width (m)</span><span className="text-white">{depModel.bodyWidth?.toFixed(0) ?? 'N/A'}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Body Thickness (m)</span><span className="text-white">{depModel.bodyThickness?.toFixed(1) ?? 'N/A'}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Sinuosity</span><span className="text-white">{depModel.sinuosity?.toFixed(2) ?? 'N/A'}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Orientation (°)</span><span className="text-white">{depModel.orientation?.toFixed(0) ?? 'N/A'}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Net/Gross</span><span className="text-cyan-400 font-bold">{(depModel.netGross * 100).toFixed(1)}%</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {Object.entries(depModel.depoElements ?? {}).map(([name, pct]) => (
                            <div key={name} className="bg-white/[0.02] p-3 rounded-xl border border-white/10 text-center">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{name}</p>
                                <p className="text-lg font-bold text-white mt-1">{(pct * 100).toFixed(1)}%</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* FACIES CLASSIFICATION */}
            {phase === 'facies' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Facies Classification — Well {SAMPLE_WELLS[selectedWell].id}</h4>
                        <p className="text-slate-500 text-xs mb-4">Core & log-derived facies: {faciesClass.method}</p>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={faciesClass.distribution.map(d => ({ name: d.facies, percent: d.percent }))} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10 }} width={140} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                <Bar dataKey="percent" barSize={18} radius={[0, 4, 4, 0]}>
                                    {faciesClass.distribution.map((_, idx) => (
                                        <Cell key={idx} fill={['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height={300} className="mt-6">
                            <LineChart data={SAMPLE_WELLS[selectedWell].md.map((d, i) => ({
                                depth: d,
                                gr: SAMPLE_WELLS[selectedWell].gr[i],
                                dt: SAMPLE_WELLS[selectedWell].dt[i],
                                rhob: SAMPLE_WELLS[selectedWell].rhob[i] * 30,
                                nphi: SAMPLE_WELLS[selectedWell].nphi[i] * 200,
                                rt: Math.log10(SAMPLE_WELLS[selectedWell].rt[i]) * 20,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="depth" stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#ffffff40" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                <Legend />
                                <Line type="monotone" dataKey="gr" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="GR" />
                                <Line type="monotone" dataKey="dt" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="DT" />
                                <Line type="monotone" dataKey="rhob" stroke="#ef4444" strokeWidth={1.5} dot={false} name="RHOBx30" />
                                <Line type="monotone" dataKey="nphi" stroke="#22c55e" strokeWidth={1.5} dot={false} name="NPHIx200" />
                                <Line type="monotone" dataKey="rt" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="log10(RT)x20" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3">Facies Distribution</h4>
                            {faciesClass.distribution.map((d, i) => (
                                <div key={i} className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-slate-300">{d.facies}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${d.percent}%`, background: ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6] }} />
                                        </div>
                                        <span className="text-[10px] text-slate-500 w-10 text-right">{d.percent.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3">Cutoff Criteria</h4>
                            {faciesClass.cutoffs.map((c, i) => (
                                <div key={i} className="text-[10px] text-slate-400 mb-1">
                                    <span className="text-cyan-400">{c.facies}</span>: {c.criteria}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* WELL CORRELATION PANELS */}
            {phase === 'correlation' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                        <h4 className="text-sm font-bold text-white mb-2">Well-to-Well Stratigraphic Correlation Panel</h4>
                        <p className="text-slate-500 text-xs mb-4">Cross-section showing key surfaces correlated across {SAMPLE_WELLS.length} wells</p>
                        {correlation.panels.map((panel, pi) => (
                            <div key={pi} className="mb-6">
                                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{panel.wells.join(' ⇄ ')}</h5>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={panel.correlationPoints.map((p, i) => {
                                        const row: any = { idx: i, surface: i % 3 === 0 ? 'MFS' : i % 3 === 1 ? 'FS' : 'SB' };
                                        panel.wells.forEach((_, wi) => { row[`depth_${wi}`] = p.depths[wi] ?? null; });
                                        return row;
                                    })}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="idx" stroke="#ffffff40" tick={{ fontSize: 10 }} label={{ value: 'Correlation Index', position: 'bottom', fill: '#ffffff40' }} />
                                        <YAxis stroke="#ffffff40" reversed tick={{ fontSize: 10 }} label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', fill: '#ffffff40' }} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                                        <Legend />
                                        {panel.wells.map((w, wi) => (
                                            <Line key={wi} type="monotone" dataKey={`depth_${wi}`} stroke={['#06b6d4', '#f59e0b', '#22c55e'][wi]} strokeWidth={2} dot={false} name={`Well ${w}`} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Max. Throw</p>
                            <p className="text-lg font-bold text-white">{correlation.statistics.maxThrow.toFixed(0)} ft</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Avg. Spacing</p>
                            <p className="text-lg font-bold text-white">{correlation.statistics.averageWellSpacing.toFixed(0)} ft</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Dip Angle</p>
                            <p className="text-lg font-bold text-white">{correlation.statistics.dipAngleDeg.toFixed(1)}°</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Strike Dir.</p>
                            <p className="text-lg font-bold text-white">{correlation.statistics.strikeDirectionDeg.toFixed(0)}°</p>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Surfaces</p>
                            <p className="text-lg font-bold text-white">{correlation.statistics.nSurfaces}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}