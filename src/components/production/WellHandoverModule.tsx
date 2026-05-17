import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, ShieldCheck, Wrench, BarChart3, AlertTriangle, Activity, Gauge, Target, TrendingUp, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

type HandoverPhase = 'H1' | 'H2' | 'H3';

export function WellHandoverModule() {
    const [activePhase, setActivePhase] = useState<HandoverPhase>('H1');

    const phases = [
        { id: 'H1' as HandoverPhase, name: 'Well Integrity', icon: ShieldCheck },
        { id: 'H2' as HandoverPhase, name: 'Schematic', icon: Wrench },
        { id: 'H3' as HandoverPhase, name: 'APE', icon: BarChart3 },
    ];

    // ── Well Integrity State ──
    const [annulusPressure, setAnnulusPressure] = useState(350);
    const [casingDepth, setCasingDepth] = useState(8500);
    const [burstRating, setBurstRating] = useState(7500);
    const [collapseRating, setCollapseRating] = useState(6000);
    const [currentBHP, setCurrentBHP] = useState(4200);

    const maasp = useMemo(() => {
        // MAASP ≈ burst rating at shoe minus the hydrostatic head of the mud column
        const hydrostatic = 0.465 * casingDepth;
        return Math.min(burstRating * 0.7 - hydrostatic, collapseRating * 0.9);
    }, [burstRating, collapseRating, casingDepth]);

    const barrierEnvelope = useMemo(() => {
        const capacity = burstRating * 0.7;
        const collapse = collapseRating * 0.9;
        return { capacity, collapse, operating: currentBHP, margin: (capacity - currentBHP) / currentBHP * 100 };
    }, [burstRating, collapseRating, currentBHP]);

    // ── APE State ──
    const [kpiScore, setKpiScore] = useState(78);
    const [nptHours, setNptHours] = useState(42);
    const [handoverChecklist, setHandoverChecklist] = useState([
        { id: 1, item: 'Casing integrity log (CBL/VDL)', checked: true },
        { id: 2, item: 'Tubing tally & coupling report', checked: true },
        { id: 3, item: 'Completion fluid cert & volume', checked: true },
        { id: 4, item: 'NTG & perforation summary', checked: false },
        { id: 5, item: 'Wellhead pressure test cert', checked: true },
        { id: 6, item: 'Downhole gauge calibration', checked: false },
        { id: 7, item: 'HSE sign-off & SIMOPS review', checked: false },
        { id: 8, item: 'As-built schematic final', checked: true },
    ]);

    const checkedCount = handoverChecklist.filter(c => c.checked).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                    <ClipboardCheck className="text-teal-500" size={32} />
                    Phase 13: Well Handover <span className="text-teal-500/50">Integrity & APE</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">
                    Asset Performance Evaluation — Ready for Operations
                </p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
                {phases.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActivePhase(p.id)}
                        className={cn(
                            'px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest',
                            activePhase === p.id
                                ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20'
                                : 'text-slate-500 hover:text-white',
                        )}
                    >
                        <p.icon size={13} />
                        {p.name}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                    {/* ── H1: Well Integrity ── */}
                    {activePhase === 'H1' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                                    <h3 className="text-xl font-black text-white italic">Annulus & Casing Monitor</h3>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">A-Annulus Pressure (psi)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range" min={0} max={2000} value={annulusPressure} onChange={e => setAnnulusPressure(Number(e.target.value))}
                                                className="w-full accent-teal-500"
                                            />
                                            <span className="text-[11px] font-black text-white w-14 text-right">{annulusPressure}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Casing Shoe Depth (ft)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range" min={3000} max={15000} value={casingDepth} onChange={e => setCasingDepth(Number(e.target.value))}
                                                className="w-full accent-teal-500"
                                            />
                                            <span className="text-[11px] font-black text-white w-14 text-right">{casingDepth}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Burst Rating (psi)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range" min={3000} max={12000} value={burstRating} onChange={e => setBurstRating(Number(e.target.value))}
                                                className="w-full accent-teal-500"
                                            />
                                            <span className="text-[11px] font-black text-white w-14 text-right">{burstRating}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Collapse Rating (psi)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range" min={2000} max={10000} value={collapseRating} onChange={e => setCollapseRating(Number(e.target.value))}
                                                className="w-full accent-teal-500"
                                            />
                                            <span className="text-[11px] font-black text-white w-14 text-right">{collapseRating}</span>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">MAASP</p>
                                        <p className={cn('text-4xl font-black italic', annulusPressure > maasp ? 'text-rose-400' : 'text-teal-400')}>
                                            {maasp.toFixed(0)} psi
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-bold mt-1">
                                            {annulusPressure > maasp ? '⚠ EXCEEDED — bleeding required' : 'Annulus pressure within limits'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-6">
                                {/* Barrier Envelope */}
                                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-full min-h-[300px] relative overflow-hidden">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-6">Barrier Envelope Diagram</h4>
                                    <div className="relative h-48 w-full max-w-md mx-auto">
                                        {/* Y-axis */}
                                        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between">
                                            <span className="text-[11px] text-slate-500 font-black">psi</span>
                                            <span className="text-[11px] text-slate-500 font-black">{burstRating * 0.9}</span>
                                            <span className="text-[11px] text-slate-500 font-black">{currentBHP}</span>
                                            <span className="text-[11px] text-slate-500 font-black">0</span>
                                        </div>
                                        {/* Bars */}
                                        <div className="ml-14 h-full flex items-end justify-center gap-6">
                                            {/* Burst Capacity */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-16 rounded-t-xl bg-gradient-to-t from-teal-500/80 to-teal-500/40 border-t-2 border-teal-500"
                                                    style={{ height: `${(barrierEnvelope.capacity / burstRating / 0.9) * 100}%` }}
                                                />
                                                <span className="text-[10px] text-teal-400 font-black mt-1 uppercase">Burst Cap</span>
                                            </div>
                                            {/* Operating */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-16 rounded-t-xl bg-gradient-to-t from-yellow-500/80 to-yellow-500/40 border-t-2 border-yellow-500"
                                                    style={{ height: `${(currentBHP / burstRating / 0.9) * 100}%` }}
                                                />
                                                <span className="text-[10px] text-yellow-400 font-black mt-1 uppercase">Operating</span>
                                            </div>
                                            {/* Collapse Limit */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-16 rounded-t-xl bg-gradient-to-t from-rose-500/80 to-rose-500/40 border-t-2 border-rose-500"
                                                    style={{ height: `${(barrierEnvelope.collapse / burstRating / 0.9) * 100}%` }}
                                                />
                                                <span className="text-[10px] text-rose-400 font-black mt-1 uppercase">Collapse</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-6">
                                        <p className="text-[11px] text-slate-400 font-bold">
                                            Operating Margin:{' '}
                                            <span className={cn('font-black italic', barrierEnvelope.margin > 50 ? 'text-teal-400' : 'text-rose-400')}>
                                                {barrierEnvelope.margin.toFixed(1)}%
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Casing Wear */}
                                <div className="glass-card p-8 rounded-3xl border-white/5 bg-teal-500/5">
                                    <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-3">Casing Wear Analysis</h5>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Max Wear Depth', value: '0.045"', status: 'ok', detail: 'Below 10% wall loss' },
                                            { label: 'Wear Interval', value: '4,200–4,750 ft', status: 'warn', detail: 'Build section — monitor' },
                                            { label: 'Remaining Life', value: '18.2 yrs', status: 'ok', detail: 'Based on current trajectory' },
                                        ].map(item => (
                                            <div key={item.label} className={cn(
                                                'p-4 rounded-xl text-center',
                                                item.status === 'ok' ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-yellow-500/10 border border-yellow-500/20',
                                            )}>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className={cn('text-lg font-black italic', item.status === 'ok' ? 'text-teal-400' : 'text-yellow-400')}>{item.value}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{item.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── H2: Schematic ── */}
                    {activePhase === 'H2' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5">
                                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-full min-h-[600px] relative overflow-hidden">
                                    <div className="absolute top-8 left-10 z-10">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Wellbore Schematic — As-Built</h4>
                                        <p className="text-[11px] text-teal-400 uppercase font-bold mt-1">Complete String Architecture</p>
                                    </div>

                                    <div className="w-full h-full flex items-center justify-center">
                                        {/* SVG Wellbore Schematic */}
                                        <svg viewBox="0 0 300 500" className="w-full max-w-[300px] h-auto" style={{ marginTop: 40 }}>
                                            {/* Background gradient */}
                                            <defs>
                                                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1a1a2e" />
                                                    <stop offset="100%" stopColor="#0a0a15" />
                                                </linearGradient>
                                            </defs>

                                            {/* Ground surface */}
                                            <rect x="20" y="10" width="260" height="30" rx="8" fill="#0d1117" stroke="#1f2937" strokeWidth="1" />
                                            <text x="150" y="30" textAnchor="middle" fill="#6b7280" fontSize="9" fontWeight="700" fontFamily="monospace">GROUND SURFACE</text>

                                            {/* Conductor 20" */}
                                            <rect x="80" y="40" width="140" height="60" rx="4" fill="none" stroke="#374151" strokeWidth="3" />
                                            <text x="225" y="72" textAnchor="start" fill="#6b7280" fontSize="8" fontWeight="700" fontFamily="monospace">20" @ 500'</text>

                                            {/* Surface Casing 13-3/8" */}
                                            <rect x="95" y="100" width="110" height="100" rx="4" fill="none" stroke="#4b5563" strokeWidth="3" />
                                            <text x="210" y="152" textAnchor="start" fill="#6b7280" fontSize="8" fontWeight="700" fontFamily="monospace">13-3/8" @ 2,200'</text>

                                            {/* Intermediate Casing 9-5/8" */}
                                            <rect x="110" y="200" width="80" height="150" rx="4" fill="none" stroke="#6b7280" strokeWidth="3" />
                                            <text x="195" y="278" textAnchor="start" fill="#6b7280" fontSize="8" fontWeight="700" fontFamily="monospace">9-5/8" @ 6,500'</text>

                                            {/* Production Tubing 3.5" */}
                                            <rect x="128" y="100" width="44" height="300" rx="3" fill="none" stroke="#14b8a6" strokeWidth="4" strokeDasharray="8,2" />
                                            <text x="175" y="252" textAnchor="start" fill="#14b8a6" fontSize="8" fontWeight="700" fontFamily="monospace">
                                                3.5" L80 Tubing
                                            </text>

                                            {/* Packer */}
                                            <rect x="115" y="250" width="70" height="12" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                                            <text x="190" y="259" textAnchor="start" fill="#f59e0b" fontSize="8" fontWeight="700" fontFamily="monospace">PACKER @ 6,200'</text>

                                            {/* Production Liner 7" */}
                                            <rect x="118" y="350" width="64" height="80" rx="4" fill="none" stroke="#9ca3af" strokeWidth="3" />
                                            <text x="187" y="392" textAnchor="start" fill="#9ca3af" fontSize="8" fontWeight="700" fontFamily="monospace">7" Liner to TD</text>

                                            {/* Perforations */}
                                            {[370, 382, 394, 406].map((y, i) => (
                                                <circle key={i} cx={130 + (i % 2) * 30} cy={y} r="3" fill="#ef4444" opacity="0.8" />
                                            ))}
                                            <text x="210" y="390" textAnchor="start" fill="#ef4444" fontSize="8" fontWeight="700" fontFamily="monospace">Perfs 8,300-8,400'</text>

                                            {/* TD */}
                                            <line x1="80" y1="435" x2="220" y2="435" stroke="#374151" strokeWidth="1" strokeDasharray="4,2" />
                                            <text x="150" y="450" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="700" fontFamily="monospace">TD: 8,500' MD</text>

                                            {/* Christmas Tree */}
                                            <polygon points="150,10 130,30 170,30" fill="#14b8a6" opacity="0.6" />
                                            <circle cx="150" cy="10" r="5" fill="#14b8a6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card p-8 rounded-3xl border-white/5 bg-teal-500/5">
                                    <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-4">Casing & Tubing Specs</h5>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="p-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">String</th>
                                                    <th className="p-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">OD (in)</th>
                                                    <th className="p-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                                                    <th className="p-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Weight (lb/ft)</th>
                                                    <th className="p-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Shoe Depth (ft)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { string: 'Conductor', od: '20.00', grade: 'X-52', weight: 94, depth: 500 },
                                                    { string: 'Surface Csg', od: '13.375', grade: 'K-55', weight: 68, depth: 2200 },
                                                    { string: 'Int. Casing', od: '9.625', grade: 'L-80', weight: 47, depth: 6500 },
                                                    { string: 'Prod. Liner', od: '7.000', grade: 'P-110', weight: 32, depth: 8500 },
                                                    { string: 'Tubing', od: '3.500', grade: 'L-80', weight: 9.2, depth: 6200 },
                                                ].map(row => (
                                                    <tr key={row.string} className="border-b border-white/5 hover:bg-teal-500/5 transition-all">
                                                        <td className="p-3 text-[10px] font-black text-white uppercase">{row.string}</td>
                                                        <td className="p-3 text-[10px] text-slate-300">{row.od}</td>
                                                        <td className="p-3 text-[10px] text-teal-400 font-bold">{row.grade}</td>
                                                        <td className="p-3 text-[10px] text-slate-300">{row.weight}</td>
                                                        <td className="p-3 text-[10px] text-slate-300">{row.depth.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#030407] text-center">
                                        <Target size={18} className="text-teal-500 mx-auto mb-2" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Tubing ID</p>
                                        <p className="text-2xl font-black text-white italic">2.992"</p>
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#030407] text-center">
                                        <Gauge size={18} className="text-teal-500 mx-auto mb-2" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Burst Margin</p>
                                        <p className="text-2xl font-black text-teal-400 italic">2.4x</p>
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#030407] text-center">
                                        <Activity size={18} className="text-teal-500 mx-auto mb-2" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Dogleg</p>
                                        <p className="text-2xl font-black text-yellow-400 italic">4.8°/100'</p>
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#030407] text-center">
                                        <AlertTriangle size={18} className="text-teal-500 mx-auto mb-2" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Flags</p>
                                        <p className="text-lg font-black text-rose-400 italic">2 minor</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── H3: APE (Asset Performance Evaluation) ── */}
                    {activePhase === 'H3' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* KPI Scorecard */}
                                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] text-center">
                                    <TrendingUp size={24} className="text-teal-500 mx-auto mb-4" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">KPI Score</p>
                                    <div className="relative w-32 h-32 mx-auto mb-4">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="14" fill="none" stroke="#1f2937" strokeWidth="4" />
                                            <circle
                                                cx="18" cy="18" r="14" fill="none"
                                                stroke={kpiScore >= 80 ? '#14b8a6' : kpiScore >= 60 ? '#f59e0b' : '#ef4444'}
                                                strokeWidth="4"
                                                strokeDasharray={`${(kpiScore / 100) * 88} 88`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <p className={cn('absolute inset-0 flex items-center justify-center text-3xl font-black italic',
                                            kpiScore >= 80 ? 'text-teal-400' : kpiScore >= 60 ? 'text-yellow-400' : 'text-rose-400')}>
                                            {kpiScore}%
                                        </p>
                                    </div>
                                    <input
                                        type="range" min={0} max={100} value={kpiScore} onChange={e => setKpiScore(Number(e.target.value))}
                                        className="w-full accent-teal-500"
                                    />
                                    <p className="text-[11px] text-slate-500 font-bold mt-2">
                                        {kpiScore >= 80 ? 'READY FOR HANDOVER' : kpiScore >= 60 ? 'CONDITIONAL APPROVAL' : 'REMEDIATION REQUIRED'}
                                    </p>
                                </div>

                                {/* NPT Analysis */}
                                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                                    <AlertTriangle size={24} className="text-yellow-500 mb-4" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Non-Productive Time</p>
                                    <p className="text-4xl font-black text-yellow-400 italic mb-3">{nptHours}<span className="text-lg text-slate-500"> hrs</span></p>
                                    <input
                                        type="range" min={0} max={120} value={nptHours} onChange={e => setNptHours(Number(e.target.value))}
                                        className="w-full accent-yellow-500"
                                    />
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="p-2 rounded-lg bg-white/5 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">NPT %</p>
                                            <p className="text-[11px] font-black text-white">{(nptHours / 480 * 100).toFixed(1)}%</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">AFE Impact</p>
                                            <p className="text-[11px] font-black text-rose-400">+${(nptHours * 1200).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Envelope */}
                                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                                    <Gauge size={24} className="text-teal-500 mb-4" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Envelope</p>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Max Drawdown', actual: '1,200 psi', limit: '1,500 psi', ok: true },
                                            { label: 'Max Rate', actual: '5,400 bbl/d', limit: '6,000 bbl/d', ok: true },
                                            { label: 'Sand Production', actual: '2.1 pptb', limit: '5.0 pptb', ok: true },
                                            { label: 'Water Cut', actual: '32%', limit: '50%', ok: true },
                                        ].map(item => (
                                            <div key={item.label} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-white font-black">{item.actual}</span>
                                                    <span className={cn('w-2 h-2 rounded-full', item.ok ? 'bg-teal-500' : 'bg-rose-500')} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Handover Checklist */}
                            <div className="glass-card p-8 rounded-3xl border-white/5 bg-teal-500/5">
                                <div className="flex justify-between items-center mb-6">
                                    <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest">Handover Checklist</h5>
                                    <span className="text-[10px] font-black text-slate-400">
                                        {checkedCount}/{handoverChecklist.length} Complete
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {handoverChecklist.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() =>
                                                setHandoverChecklist(prev =>
                                                    prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c),
                                                )
                                            }
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                                                item.checked
                                                    ? 'bg-teal-500/10 border-teal-500/30'
                                                    : 'bg-white/5 border-white/10 hover:border-teal-500/20',
                                            )}
                                        >
                                            <div className={cn(
                                                'w-5 h-5 rounded-md flex items-center justify-center border',
                                                item.checked ? 'bg-teal-500 border-teal-500' : 'border-white/20',
                                            )}>
                                                {item.checked && <Layers size={12} className="text-black" />}
                                            </div>
                                            <span className={cn('text-[10px] font-bold', item.checked ? 'text-white' : 'text-slate-500')}>
                                                {item.item}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-6">
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(checkedCount / handoverChecklist.length) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold mt-2 text-right">
                                        {checkedCount === handoverChecklist.length ? '✅ ALL CLEAR — Ready for Production' : `${handoverChecklist.length - checkedCount} items pending`}
                                    </p>
                                </div>
                            </div>

                            {/* APE Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Technical Readiness', value: `${kpiScore}%`, color: 'text-teal-400' },
                                    { label: 'HSE Compliance', value: 'Pass', color: 'text-green-400' },
                                    { label: 'Regulatory', value: 'Approved', color: 'text-teal-400' },
                                    { label: 'Handover Status', value: checkedCount === handoverChecklist.length ? 'READY' : 'PENDING', color: checkedCount === handoverChecklist.length ? 'text-green-400' : 'text-yellow-400' },
                                ].map(item => (
                                    <div key={item.label} className="glass-card p-5 rounded-2xl border-white/5 bg-teal-500/5 text-center">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className={cn('text-xl font-black italic', item.color)}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}