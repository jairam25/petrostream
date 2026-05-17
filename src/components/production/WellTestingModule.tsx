import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Gauge, Wrench, TrendingUp, TestTube, Flame, Droplets,
    Activity, AlertTriangle, Wind, Zap, Timer, BarChart3,
    Ruler, Globe, Calculator, ChevronRight, CheckCircle2,
    XCircle, HelpCircle, ArrowUpCircle, ArrowDownCircle, Minus,
    Waves, Grip, Eye, Thermometer, DropletsIcon, ShieldCheck
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

// ============================================================================
// Sub-Step 3.5: Well Testing (DST & Multirate Analysis)
// ============================================================================
// Rigorous DST design, multirate deliverability testing,
// backpressure equation (C & n), AOF, PTA quick-look,
// and fluid sampling analysis for industrial engineers.
// ============================================================================

type TestTab = 'dst-design' | 'multirate' | 'pta' | 'sampling' | 'safety';

interface DSTComponent {
    name: string;
    desc: string;
    spec: string;
}

interface MultiratePoint {
    id: number;
    choke64: number;
    pwf: number;
    qo: number;
    qg: number;
    qw: number;
}

export function WellTestingModule() {
    const [activeTab, setActiveTab] = useState<TestTab>('dst-design');

    // DST String Designer State
    const [selectedPacker, setSelectedPacker] = useState('RTTS Retrievable');
    const [selectedGauge, setSelectedGauge] = useState('Quartz Crystal');
    const [tvd, setTvd] = useState(12000);
    const [holeSize, setHoleSize] = useState(8.5);
    const [expectedDP, setExpectedDP] = useState(3000);
    const [tubingWeight, setTubingWeight] = useState(15.5);
    const [overpullFactor, setOverpullFactor] = useState(1.5);

    // Multirate Test State
    const [reservoirPressure, setReservoirPressure] = useState(4500);
    const [multiratePoints, setMultiratePoints] = useState<MultiratePoint[]>([
        { id: 1, choke64: 16, pwf: 4200, qo: 250, qg: 500, qw: 5 },
        { id: 2, choke64: 24, pwf: 3900, qo: 480, qg: 950, qw: 8 },
        { id: 3, choke64: 32, pwf: 3500, qo: 720, qg: 1450, qw: 12 },
        { id: 4, choke64: 48, pwf: 2800, qo: 1050, qg: 2100, qw: 18 },
    ]);
    const [isGasWell, setIsGasWell] = useState(false);

    // PTA Quick-Look State
    const [ptaQ, setPtaQ] = useState(500);
    const [ptaH, setPtaH] = useState(50);
    const [ptaMu, setPtaMu] = useState(0.8);
    const [ptaBo, setPtaBo] = useState(1.2);
    const [ptaDpElapsed, setPtaDpElapsed] = useState(10);
    const [ptaDerivativeAt1, setPtaDerivativeAt1] = useState(8.5);
    const [ptaRx, setPtaRx] = useState(0.5);
    const [ptaPhi, setPtaPhi] = useState(0.15);
    const [ptaCt, setPtaCt] = useState(1.5e-5);

    // Sampling State
    const [sepPressure, setSepPressure] = useState(500);
    const [sepTemp, setSepTemp] = useState(120);
    const [gorTest, setGorTest] = useState(800);
    const [oilGravity, setOilGravity] = useState(35);
    const [gasSG, setGasSG] = useState(0.65);
    const [h2sPpm, setH2sPpm] = useState(100);
    const [co2Percent, setCo2Percent] = useState(2);

    // Safety State
    const [bsAndW, setBsAndW] = useState(0.5);
    const [sandRate, setSandRate] = useState(2);
    const [flaringVolume, setFlareVolume] = useState(1500);
    const [chokePressDrop, setChokePressDrop] = useState(1200);

    // ========================================================================
    // DST STRING CALCULATIONS
    // ========================================================================
    const dstCalculations = useMemo(() => {
        const tubingLength = tvd + 500;
        const totalTubingWeight = (tubingWeight * tubingLength) / 1000;
        const overpullRequired = totalTubingWeight * overpullFactor;

        const tubingSizes = [
            { size: 2.375, wt: 6.25, id: 1.995, tensileYield: 65, cost: 85 },
            { size: 2.875, wt: 10.4, id: 2.441, tensileYield: 108, cost: 100 },
            { size: 3.5, wt: 15.5, id: 2.992, tensileYield: 160, cost: 120 },
            { size: 4.5, wt: 18.9, id: 3.826, tensileYield: 230, cost: 155 },
            { size: 5.5, wt: 26.8, id: 4.670, tensileYield: 350, cost: 195 },
        ];
        const minSafeSize = tubingSizes.find(s => s.tensileYield >= overpullRequired) || tubingSizes[tubingSizes.length - 1];

        const packerDiffPressure = expectedDP;

        const dstComponents: DSTComponent[] = [
            { name: 'Slip Joint', desc: 'Allows vertical movement due to temperature/pressure changes. Length: +/-10 ft stroke.', spec: '10 ft stroke, 3-1/2" IF box up/pin down' },
            { name: 'Flow Head', desc: 'Surface isolation of test from rig floor. Swivel allows rotation.', spec: '10K WP, dual 4-1/16" outlets' },
            { name: 'Tester Valve', desc: 'Opens/closes downhole for flow-buildup cycles. Annulus pressure operated.', spec: '15K WP, full-bore, N2 charged' },
            { name: 'LPR-N Valve', desc: 'Nitrogen-charged reference valve for repeated closures without repulling.', spec: 'N2 charged, +/-50 hr operational window' },
            { name: 'MultiCycle Circulating Valve', desc: 'Controlled by annulus pressure cycles. Used to reverse-circulate after test.', spec: 'Pressure cycle operated, full-bore' },
            { name: 'Gauge Carrier', desc: 'Holds quartz/sapphire gauges for P/T recording. Straddle design for redundant gauges.', spec: 'Up to 4 gauges, 20K/350F rating' },
            { name: 'Hydraulic Jar', desc: 'Jarring action to free stuck assembly. Upstroke jar.', spec: '3.5"-5", 500 ft-lb impact' },
            { name: 'Safety Joint', desc: 'Emergency release point if jarring fails. Left-hand release.', spec: '+/-6 turns left-hand release at ball race' },
            { name: 'Packer', desc: 'Isolates test zone. Retrievable mechanical-set or inflatable for open hole.', spec: '10K differential, 230F element rating' },
            { name: 'Perforated Anchor', desc: 'Tail pipe below packer. Ensures debris does not plug gauge intake.', spec: '20 ft slotted pipe with bull plug' },
            { name: 'Downhole Choke', desc: 'Critical flow choke for open-hole testing. Prevents sanding.', spec: 'Fixed bean, carbide insert' },
            { name: 'Surface Choke Manifold', desc: 'Adjustable choke for multirate testing. Calibrated beans.', spec: '10K WP, 2" lines, adjustable + fixed beans' },
            { name: 'Test Separator', desc: '3-phase separation for rate measurement. Coriolis or turbine metering.', spec: '1440 bbl/D liquid, 25 MMscf/D gas' },
            { name: 'Flare Boom', desc: 'Burns produced hydrocarbons at safe distance. Air/steam assist for smokeless.', spec: '50 ft boom, 160 ft from rig floor' },
        ];

        return { totalTubingWeight, overpullRequired, minSafeSize, packerDiffPressure, dstComponents, tubingSizes };
    }, [tvd, tubingWeight, overpullFactor, expectedDP, holeSize]);

    // ========================================================================
    // MULTIRATE DELIVERABILITY CALCULATIONS
    // ========================================================================
    const deliverabilityResults = useMemo(() => {
        if (multiratePoints.length < 2) {
            return { c: 0, n: 0, aof: 0, points: multiratePoints, error: 'Need at least 2 test points' };
        }

        if (isGasWell) {
            const pr2 = reservoirPressure * reservoirPressure;
            const xs: number[] = [];
            const ys: number[] = [];

            for (const p of multiratePoints) {
                const deltaP2 = pr2 - p.pwf * p.pwf;
                if (deltaP2 <= 0) continue;
                xs.push(Math.log10(deltaP2));
                ys.push(Math.log10(p.qg * 1000));
            }

            if (xs.length < 2) {
                return { c: 0, n: 0, aof: 0, points: multiratePoints, error: 'Invalid test points (pwf >= pr)' };
            }

            const n = xs.length;
            const sumX = xs.reduce((a, b) => a + b, 0);
            const sumY = ys.reduce((a, b) => a + b, 0);
            const sumXY = xs.reduce((a, b, i) => a + b * ys[i], 0);
            const sumX2 = xs.reduce((a, b) => a + b * b, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            const c = Math.pow(10, intercept) / 1000;

            const aofPwf = 14.7;
            const aof_delta = pr2 - aofPwf * aofPwf;
            const aof = aof_delta > 0 ? c * Math.pow(aof_delta, slope) : 0;

            return { c, n: slope, aof, points: multiratePoints, error: null };
        } else {
            const pis = multiratePoints.map(p => {
                const dp = reservoirPressure - p.pwf;
                if (dp <= 0) return 0;
                return p.qo / dp;
            }).filter(pi => pi > 0);

            if (pis.length < 1) {
                return { c: 0, n: 0, aof: 0, points: multiratePoints, error: 'All test points below reservoir pressure required' };
            }

            const avgPI = pis.reduce((a, b) => a + b, 0) / pis.length;

            const pr2 = reservoirPressure * reservoirPressure;
            const xsOil = multiratePoints
                .filter(p => p.pwf < reservoirPressure)
                .map(p => Math.log10(pr2 - p.pwf * p.pwf));
            const ysOil = multiratePoints
                .filter(p => p.pwf < reservoirPressure)
                .map(p => Math.log10(p.qo));

            let cOil = 0, nOil = 1.0;
            if (xsOil.length >= 2) {
                const N = xsOil.length;
                const sX = xsOil.reduce((a, b) => a + b, 0);
                const sY = ysOil.reduce((a, b) => a + b, 0);
                const sXY = xsOil.reduce((a, b, i) => a + b * ysOil[i], 0);
                const sX2 = xsOil.reduce((a, b) => a + b * b, 0);
                nOil = (N * sXY - sX * sY) / (N * sX2 - sX * sX);
                cOil = Math.pow(10, (sY - nOil * sX) / N);
            }

            const aof = cOil * Math.pow(pr2 - 14.7 * 14.7, nOil);

            return {
                c: cOil,
                n: nOil,
                aof: Math.max(0, aof),
                avgPI,
                points: multiratePoints,
                error: null,
            };
        }
    }, [multiratePoints, reservoirPressure, isGasWell]);

    // ========================================================================
    // PTA QUICK-LOOK CALCULATIONS
    // ========================================================================
    const ptaResults = useMemo(() => {
        const dpAt1hr = ptaDpElapsed;
        const derivLn = ptaDerivativeAt1;
        const q = ptaQ;
        const h = ptaH;
        const mu = ptaMu;
        const bo = ptaBo;

        const kFromDerivative = derivLn > 0 ? (162.6 * q * mu * bo) / (derivLn * h) : 0;

        const m = derivLn;
        let skinValue = 0;
        if (m > 0 && ptaPhi > 0 && ptaCt > 0 && ptaRx > 0) {
            const logTerm = Math.log10(kFromDerivative / (ptaPhi * mu * ptaCt * ptaRx * ptaRx));
            skinValue = 1.151 * ((dpAt1hr / m) - logTerm + 3.23);
        }

        const c_wbs = (q * bo) / (24 * derivLn);
        const rInvAt1hr = Math.sqrt(kFromDerivative * 1 / (948 * ptaPhi * mu * ptaCt));

        const derivativeSlope = 0;
        let flowRegime = 'Radial Flow (IARF)';
        if (derivativeSlope > 0.8) flowRegime = 'Wellbore Storage (unit slope)';
        else if (derivativeSlope > 0.3 && derivativeSlope < 0.7) flowRegime = 'Linear Flow (fracture)';
        else if (derivativeSlope < -0.1) flowRegime = 'Dual Porosity (dip/valley)';
        else if (derivativeSlope > 0.5) flowRegime = 'Boundary Effect (late-time rise)';

        const kh = kFromDerivative * h;
        const transmissibility = kh / mu;

        return { kFromDerivative, kh, transmissibility, skinValue, c_wbs, rInvAt1hr, flowRegime };
    }, [ptaQ, ptaH, ptaMu, ptaBo, ptaDpElapsed, ptaDerivativeAt1, ptaRx, ptaPhi, ptaCt]);

    // ========================================================================
    // SAMPLING CALCULATIONS
    // ========================================================================
    const samplingResults = useMemo(() => {
        const separatorGOR = gorTest;
        const yg = gasSG;
        const api = oilGravity;
        const tF = sepTemp;
        if (separatorGOR > 0 && yg > 0) {
            const term = Math.pow(separatorGOR / yg, 0.83) * Math.pow(10, 0.00091 * tF - 0.0125 * api);
            const pbEstimate = 18.2 * (term - 1.4);
            const boPb = 0.9759 + 0.00012 * Math.pow(separatorGOR * Math.sqrt(yg / (api / 141.5 + 0.1315)) + 1.25 * tF, 1.2);

            const contaminationWarning = h2sPpm > 20
                ? 'H2S above 20 ppm -- sour service materials required (NACE MR0175)'
                : co2Percent > 2
                    ? 'CO2 above 2% -- 13Cr or duplex stainless steel recommended'
                    : 'Fluid within standard material limits';

            return { pbEstimate: Math.max(0, pbEstimate), boPb, separatorGOR, contaminationWarning };
        }
        return { pbEstimate: 0, boPb: 1.0, separatorGOR, contaminationWarning: 'Insufficient data' };
    }, [sepPressure, sepTemp, gorTest, oilGravity, gasSG, h2sPpm, co2Percent]);

    // ========================================================================
    // SAFETY CALCULATIONS
    // ========================================================================
    const safetyResults = useMemo(() => {
        const bsAndWAlarm = bsAndW > 2 ? 'HIGH -- requires diversion to slop tank' : 'Normal';
        const bsAndWColor = bsAndW > 2 ? 'text-red-400' : bsAndW > 1 ? 'text-yellow-400' : 'text-emerald-400';
        const sandAlarm = sandRate > 5 ? 'HIGH -- throttle choke, consider gravel pack' : sandRate > 2 ? 'Monitor -- trending upward' : 'Normal';
        const sandColor = sandRate > 5 ? 'text-red-400' : sandRate > 2 ? 'text-yellow-400' : 'text-emerald-400';
        const flareAlarm = flaringVolume > 5000 ? 'HIGH -- reduce rate or route to pipeline' : flaringVolume > 1000 ? 'Moderate -- monitor' : 'Normal';
        const flareColor = flaringVolume > 5000 ? 'text-red-400' : flaringVolume > 1000 ? 'text-yellow-400' : 'text-emerald-400';
        const chokeAlarm = chokePressDrop > 2500 ? 'CAUTION: Choke erosion possible (high deltaP)' : 'Normal operating range';
        const chokeColor = chokePressDrop > 2500 ? 'text-yellow-400' : 'text-emerald-400';

        return { bsAndWAlarm, bsAndWColor, sandAlarm, sandColor, flareAlarm, flareColor, chokeAlarm, chokeColor };
    }, [bsAndW, sandRate, flaringVolume, chokePressDrop]);

    const chokeSizes64 = useMemo(() => [8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 112, 128], []);

    // ========================================================================
    // RENDER
    // ========================================================================
    const tabs: { id: TestTab; label: string; icon: any }[] = [
        { id: 'dst-design', label: 'DST Design', icon: Wrench },
        { id: 'multirate', label: 'Deliverability', icon: TrendingUp },
        { id: 'pta', label: 'PTA Quick-Look', icon: BarChart3 },
        { id: 'sampling', label: 'Fluid Sampling', icon: TestTube },
        { id: 'safety', label: 'Safety and HSE', icon: ShieldCheck },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                    <Gauge className="text-amber-500" size={32} />
                    Sub-Step 3.5: Well Testing <span className="text-amber-500/50">& DST Analysis</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">
                    Drill-Stem Testing &bull; Multirate Deliverability &bull; AOF &bull; PTA Quick-Look
                </p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                            activeTab === t.id
                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                : "text-slate-500 hover:text-white"
                        )}
                    >
                        <t.icon size={13} />
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {/* ================================================================ */}
                    {/* TAB: DST STRING DESIGNER */}
                    {/* ================================================================ */}
                    {activeTab === 'dst-design' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Ruler size={14} /> Well Parameters
                                    </h4>
                                    <div className="space-y-4">
                                        <InputWithSlider label="TVD (ft)" value={tvd} onChange={setTvd} min={500} max={35000} step={100} />
                                        <InputWithSlider label="Hole Size (in)" value={holeSize} onChange={setHoleSize} min={4.5} max={26} step={0.5} />
                                        <InputWithSlider label="Expected dP (psi)" value={expectedDP} onChange={setExpectedDP} min={100} max={15000} step={100} />
                                        <InputWithSlider label="Tubing Weight (lb/ft)" value={tubingWeight} onChange={setTubingWeight} min={4.7} max={32.0} step={0.5} />
                                        <InputWithSlider label="Overpull Factor" value={overpullFactor} onChange={setOverpullFactor} min={1.1} max={2.5} step={0.05} />
                                    </div>
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5 space-y-4">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                        <Grip size={14} /> Packer and Gauge
                                    </h4>
                                    <div>
                                        <label className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Packer Type</label>
                                        <select
                                            value={selectedPacker}
                                            onChange={e => setSelectedPacker(e.target.value)}
                                            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold"
                                        >
                                            <option>RTTS Retrievable</option>
                                            <option>CHAMP Retrievable</option>
                                            <option>CHAMP XHP Retrievable</option>
                                            <option>Retrievable Inflatable</option>
                                            <option>Permanent Production Packer</option>
                                            <option>ESP Packer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Gauge Type</label>
                                        <select
                                            value={selectedGauge}
                                            onChange={e => setSelectedGauge(e.target.value)}
                                            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold"
                                        >
                                            <option>Quartz Crystal</option>
                                            <option>Sapphire</option>
                                            <option>Dual Quartz + Sapphire</option>
                                            <option>Permanent Downhole Gauge (PDG)</option>
                                            <option>Fiber Optic DTS/DAS</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2 space-y-4">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Calculator size={14} /> String Calculations
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-black">Tubing Length</p>
                                            <p className="text-sm font-black text-white">{formatNumber(tvd + 500, 0)} ft</p>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-black">Hook Load</p>
                                            <p className="text-sm font-black text-white">{formatNumber(dstCalculations.totalTubingWeight, 1)} kips</p>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-black">Overpull Margin</p>
                                            <p className={cn("text-sm font-black", dstCalculations.minSafeSize.tensileYield >= dstCalculations.overpullRequired ? 'text-emerald-400' : 'text-red-400')}>
                                                {formatNumber(dstCalculations.overpullRequired, 1)} kips
                                            </p>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-black">Min Safe Tubing</p>
                                            <p className="text-sm font-black text-amber-400">
                                                {dstCalculations.minSafeSize.size}" ({dstCalculations.minSafeSize.wt} lb/ft)
                                            </p>
                                        </div>
                                        <div className="col-span-2 bg-black/30 rounded-xl p-3">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-black">Packer dP Rating Required</p>
                                            <p className={cn("text-sm font-black", dstCalculations.packerDiffPressure <= 10000 ? 'text-emerald-400' : 'text-yellow-400')}>
                                                {formatNumber(dstCalculations.packerDiffPressure, 0)} psi
                                                {dstCalculations.packerDiffPressure > 10000 ? ' -- Consider dual packer or HP configuration' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2 h-full">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Globe size={14} /> DST String Configuration
                                    </h4>
                                    <div className="space-y-0 relative pl-6 border-l-2 border-amber-500/30">
                                        {dstCalculations.dstComponents.map((comp, idx) => (
                                            <div key={comp.name} className="relative pb-5 last:pb-0">
                                                <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500/50 border border-amber-500/30" />
                                                <div className="bg-black/30 rounded-xl p-3 hover:bg-amber-500/5 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[11px] font-black text-white">{comp.name}</p>
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase">D{idx + 1}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{comp.desc}</p>
                                                    <p className="text-[10px] text-slate-600 mt-0.5 font-bold">{comp.spec}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Ruler size={14} /> Tubing Sizing Reference
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[11px] text-left border-collapse">
                                                <thead>
                                                    <tr className="text-slate-500 uppercase tracking-wider font-black">
                                                        <th className="p-2 border-b border-white/5">OD (in)</th>
                                                        <th className="p-2 border-b border-white/5">Wt (lb/ft)</th>
                                                        <th className="p-2 border-b border-white/5">ID (in)</th>
                                                        <th className="p-2 border-b border-white/5">Tensile Yield (kips)</th>
                                                        <th className="p-2 border-b border-white/5">Cost ($/ft)</th>
                                                        <th className="p-2 border-b border-white/5">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dstCalculations.tubingSizes.map(ts => (
                                                        <tr key={ts.size} className={cn(
                                                            "border-b border-white/5",
                                                            ts.size === dstCalculations.minSafeSize.size ? "bg-amber-500/10" : ""
                                                        )}>
                                                            <td className="p-2 font-bold text-white">{ts.size}"</td>
                                                            <td className="p-2 text-slate-400">{ts.wt}</td>
                                                            <td className="p-2 text-slate-400">{ts.id}</td>
                                                            <td className={cn("p-2 font-bold", ts.tensileYield >= dstCalculations.overpullRequired ? 'text-emerald-400' : 'text-red-400')}>
                                                                {formatNumber(ts.tensileYield, 0)}
                                                            </td>
                                                            <td className="p-2 text-slate-400">${formatNumber(ts.cost, 0)}</td>
                                                            <td className="p-2">
                                                                {ts.tensileYield >= dstCalculations.overpullRequired
                                                                    ? <CheckCircle2 size={12} className="text-emerald-400" />
                                                                    : <XCircle size={12} className="text-red-400" />}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================================================================ */}
                    {/* TAB: MULTIRATE DELIVERABILITY */}
                    {/* ================================================================ */}
                    {activeTab === 'multirate' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsGasWell(false)}
                                        className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            !isGasWell ? "bg-teal-500 text-black shadow-lg" : "text-slate-500 bg-white/5")}
                                    >
                                        <Droplets size={12} className="inline mr-1" /> Oil Well
                                    </button>
                                    <button
                                        onClick={() => setIsGasWell(true)}
                                        className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            isGasWell ? "bg-rose-500 text-white shadow-lg" : "text-slate-500 bg-white/5")}
                                    >
                                        <Flame size={12} className="inline mr-1" /> Gas Well
                                    </button>
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Gauge size={14} /> Input Parameters
                                    </h4>
                                    <InputWithSlider
                                        label="Reservoir Pressure (psi)"
                                        value={reservoirPressure}
                                        onChange={setReservoirPressure}
                                        min={100} max={25000} step={50}
                                    />
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp size={14} /> Test Points
                                        </h4>
                                        <button
                                            onClick={() => setMultiratePoints(prev => [
                                                ...prev, {
                                                    id: (prev.length + 1),
                                                    choke64: prev.length > 0 ? prev[prev.length - 1].choke64 + 8 : 16,
                                                    pwf: Math.max(0, prev.length > 0 ? prev[prev.length - 1].pwf - 200 : reservoirPressure - 200),
                                                    qo: prev.length > 0 ? prev[prev.length - 1].qo + 200 : 200,
                                                    qg: prev.length > 0 ? prev[prev.length - 1].qg + 400 : 400,
                                                    qw: prev.length > 0 ? prev[prev.length - 1].qw + 3 : 5,
                                                }
                                            ])}
                                            className="text-[11px] bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider hover:bg-amber-500/30 transition-all"
                                        >
                                            + Add Point
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {multiratePoints.map((point, idx) => (
                                            <div key={point.id} className="grid grid-cols-5 gap-2 bg-black/30 rounded-xl p-3 items-center">
                                                <select
                                                    value={point.choke64}
                                                    onChange={e => {
                                                        const newPoints = [...multiratePoints];
                                                        newPoints[idx] = { ...point, choke64: Number(e.target.value) };
                                                        setMultiratePoints(newPoints);
                                                    }}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[11px] font-bold w-full"
                                                >
                                                    {chokeSizes64.map(c => (
                                                        <option key={c} value={c}>{c}/64"</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    value={point.pwf}
                                                    onChange={e => {
                                                        const newPoints = [...multiratePoints];
                                                        newPoints[idx] = { ...point, pwf: Number(e.target.value) };
                                                        setMultiratePoints(newPoints);
                                                    }}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[11px] font-bold w-full text-center"
                                                    placeholder="pwf"
                                                />
                                                <input
                                                    type="number"
                                                    value={point.qo}
                                                    onChange={e => {
                                                        const newPoints = [...multiratePoints];
                                                        newPoints[idx] = { ...point, qo: Number(e.target.value) };
                                                        setMultiratePoints(newPoints);
                                                    }}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[11px] font-bold w-full text-center"
                                                    placeholder={isGasWell ? 'qg' : 'qo'}
                                                />
                                                <input
                                                    type="number"
                                                    value={point.qg}
                                                    onChange={e => {
                                                        const newPoints = [...multiratePoints];
                                                        newPoints[idx] = { ...point, qg: Number(e.target.value) };
                                                        setMultiratePoints(newPoints);
                                                    }}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[11px] font-bold w-full text-center"
                                                    placeholder="qg"
                                                />
                                                <button
                                                    onClick={() => setMultiratePoints(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Calculator size={14} /> {isGasWell ? 'Backpressure Equation Results' : 'Deliverability Results'}
                                    </h4>

                                    {deliverabilityResults.error ? (
                                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                                            {deliverabilityResults.error}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-black/30 rounded-2xl p-5 text-center">
                                                {isGasWell ? (
                                                    <div>
                                                        <p className="text-[11px] text-slate-400 font-black mb-2">Rawlins & Schellhardt (Backpressure)</p>
                                                        <p className="text-lg font-black text-amber-400 italic tracking-tight">
                                                            q<sub>g</sub> = {formatNumber(deliverabilityResults.c, 6)} &middot; (p&#772;<sub>R</sub>^2 - p<sub>wf</sub>^2)<sup>{formatNumber(deliverabilityResults.n, 4)}</sup>
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 mt-1">C={formatNumber(deliverabilityResults.c, 6)} Mscf/D/psi^(2n), n={formatNumber(deliverabilityResults.n, 4)}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-[11px] text-slate-400 font-black mb-2">Fetkovich Deliverability</p>
                                                        <p className="text-lg font-black text-teal-400 italic tracking-tight">
                                                            q<sub>o</sub> = {formatNumber(deliverabilityResults.c, 6)} &middot; (p&#772;<sub>R</sub>^2 - p<sub>wf</sub>^2)<sup>{formatNumber(deliverabilityResults.n, 4)}</sup>
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 mt-1">C={formatNumber(deliverabilityResults.c, 6)}, n={formatNumber(deliverabilityResults.n, 4)}, PI_avg={(deliverabilityResults as any).avgPI ? formatNumber((deliverabilityResults as any).avgPI, 2) + ' STB/D/psi' : 'N/A'}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">AOF</p>
                                                    <p className="text-2xl font-black text-white mt-1">{formatNumber(deliverabilityResults.aof, 1)}</p>
                                                    <p className="text-[10px] text-slate-600">{isGasWell ? 'Mscf/D' : 'STB/D'}</p>
                                                </div>
                                                <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Flow Exponent n</p>
                                                    <p className="text-2xl font-black text-white mt-1">{formatNumber(deliverabilityResults.n, 4)}</p>
                                                    <p className="text-[10px] text-slate-600">
                                                        {deliverabilityResults.n < 0.5 ? 'non-Darcy flow dominant' :
                                                            deliverabilityResults.n > 0.8 ? 'near-laminar flow' : 'transitional'}
                                                    </p>
                                                </div>
                                                <div className="bg-black/30 rounded-2xl p-4 text-center">
                                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Test Points</p>
                                                    <p className="text-2xl font-black text-white mt-1">{deliverabilityResults.points.length}</p>
                                                    <p className="text-[10px] text-slate-600">multirate tests</p>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-[11px] text-left border-collapse">
                                                    <thead>
                                                        <tr className="text-slate-500 uppercase tracking-wider font-black border-b border-white/5">
                                                            <th className="p-2">Choke</th>
                                                            <th className="p-2">pwf (psi)</th>
                                                            <th className="p-2">dP^2 (psi^2)</th>
                                                            <th className="p-2">{isGasWell ? 'qg (Mscf/D)' : 'qo (STB/D)'}</th>
                                                            <th className="p-2">{isGasWell ? 'qg_calc' : 'qo_calc'}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {deliverabilityResults.points.map(p => {
                                                            const pr2 = reservoirPressure * reservoirPressure;
                                                            const dp2 = pr2 - p.pwf * p.pwf;
                                                            const qCalc = dp2 > 0 && deliverabilityResults.c > 0
                                                                ? deliverabilityResults.c * Math.pow(dp2, deliverabilityResults.n)
                                                                : 0;
                                                            const val = isGasWell ? p.qg : p.qo;
                                                            return (
                                                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                                                                    <td className="p-2 text-white font-bold">{p.choke64}/64"</td>
                                                                    <td className="p-2 text-slate-400">{formatNumber(p.pwf, 0)}</td>
                                                                    <td className="p-2 text-slate-400">{formatNumber(dp2 / 1e6, 2)}x10^6</td>
                                                                    <td className="p-2 text-white font-bold">{formatNumber(val, 0)}</td>
                                                                    <td className="p-2 text-amber-400 font-bold">{formatNumber(qCalc, 0)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BarChart3 size={14} /> Deliverability Plot (Conceptual)
                                    </h4>
                                    <div className="bg-black/30 rounded-2xl p-6 h-48 flex items-center justify-center relative">
                                        <div className="absolute inset-4 flex flex-col justify-between">
                                            <div className="flex items-center justify-between text-[10px] text-slate-600">
                                                <span>pwf=0 (AOF)</span>
                                                <span className="text-[11px] font-black text-amber-400">qAOF</span>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <svg viewBox="0 0 200 100" className="w-full h-full max-w-md">
                                                    <line x1="40" y1="10" x2="40" y2="90" stroke="#334155" strokeWidth="1" />
                                                    <line x1="40" y1="90" x2="190" y2="90" stroke="#334155" strokeWidth="1" />
                                                    <path d="M40,50 Q80,60 120,70 T180,88" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                                                    <line x1="40" y1="10" x2="190" y2="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
                                                    <text x="195" y="14" fill="#ef4444" fontSize="7" fontFamily="sans-serif">pwf=14.7 (AOF)</text>
                                                    <text x="95" y="98" fill="#64748b" fontSize="7" fontFamily="sans-serif" textAnchor="middle">{'Rate →'}</text>
                                                    <text x="10" y="55" fill="#64748b" fontSize="7" fontFamily="sans-serif" textAnchor="middle" transform="rotate(-90,10,55)">{'pwf →'}</text>
                                                    {multiratePoints.map((p) => {
                                                        const pr2 = reservoirPressure * reservoirPressure;
                                                        const dpMax = pr2 - 14.7 * 14.7;
                                                        const dp = pr2 - p.pwf * p.pwf;
                                                        const x = 40 + (dp / Math.max(dpMax, 1)) * 150;
                                                        const y = 90 - (p.pwf / reservoirPressure) * 80;
                                                        return (
                                                            <g key={p.id}>
                                                                <circle cx={x} cy={y} r={3} fill="#f59e0b" />
                                                                <text x={x} y={y - 6} fill="#f59e0b" fontSize="6" textAnchor="middle" fontFamily="sans-serif">{p.choke64}/64</text>
                                                            </g>
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-600">
                                                <span>pwf=pr</span>
                                                <span className="text-[11px] font-black text-amber-400">q=0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================================================================ */}
                    {/* TAB: PTA QUICK-LOOK */}
                    {/* ================================================================ */}
                    {activeTab === 'pta' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={14} /> Well and Fluid Properties
                                    </h4>
                                    <div className="space-y-4">
                                        <InputWithSlider label="Flow Rate q (STB/D)" value={ptaQ} onChange={setPtaQ} min={10} max={50000} step={10} />
                                        <InputWithSlider label="Net Pay h (ft)" value={ptaH} onChange={setPtaH} min={1} max={2000} step={1} />
                                        <InputWithSlider label="Viscosity mu (cP)" value={ptaMu} onChange={setPtaMu} min={0.1} max={100} step={0.01} />
                                        <InputWithSlider label="FVF Bo (rb/STB)" value={ptaBo} onChange={setPtaBo} min={0.5} max={5} step={0.01} />
                                    </div>
                                </div>
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Timer size={14} /> Pressure Transient Data
                                    </h4>
                                    <div className="space-y-4">
                                        <InputWithSlider label="dp at dt=1 hr (psi)" value={ptaDpElapsed} onChange={setPtaDpElapsed} min={0.1} max={5000} step={0.1} />
                                        <InputWithSlider label="Derivative at dt=1hr (psi)" value={ptaDerivativeAt1} onChange={setPtaDerivativeAt1} min={0.01} max={5000} step={0.1} />
                                        <InputWithSlider label="Wellbore Radius rw (ft)" value={ptaRx} onChange={setPtaRx} min={0.1} max={2.0} step={0.05} />
                                        <InputWithSlider label="Porosity phi" value={ptaPhi} onChange={setPtaPhi} min={0.01} max={0.45} step={0.01} />
                                        <InputWithSlider label="Ct (1/psi)" value={ptaCt} onChange={setPtaCt} min={5e-7} max={5e-4} step={1e-6} />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Calculator size={14} /> PTA Interpretation Results
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Permeability (k)', value: formatNumber(ptaResults.kFromDerivative, 1), unit: 'mD', color: 'text-teal-400' },
                                            { label: 'k.h Product', value: formatNumber(ptaResults.kh, 0), unit: 'mD.ft', color: 'text-teal-400' },
                                            { label: 'Transmissibility', value: formatNumber(ptaResults.transmissibility, 0), unit: 'mD.ft/cP', color: 'text-amber-400' },
                                            { label: 'Skin Factor (S)', value: formatNumber(ptaResults.skinValue, 2), unit: ptaResults.skinValue > 2 ? 'Damaged' : ptaResults.skinValue < -3 ? 'Stimulated' : 'Normal', color: ptaResults.skinValue > 2 ? 'text-red-400' : ptaResults.skinValue < -3 ? 'text-emerald-400' : 'text-white' },
                                            { label: 'WBS Coefficient', value: formatNumber(ptaResults.c_wbs, 4), unit: 'bbl/psi', color: 'text-slate-400' },
                                            { label: 'r_inv at dt=1 hr', value: formatNumber(ptaResults.rInvAt1hr, 1), unit: 'ft', color: 'text-slate-400' },
                                        ].map(item => (
                                            <div key={item.label} className="bg-black/30 rounded-2xl p-4">
                                                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">{item.label}</p>
                                                <p className={cn("text-xl font-black mt-1", item.color)}>{item.value}</p>
                                                <p className="text-[10px] text-slate-600">{item.unit}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={14} /> Flow Regime Interpretation
                                    </h4>
                                    <div className="bg-black/30 rounded-2xl p-5">
                                        <p className="text-[11px] font-black text-amber-400 mb-3">{ptaResults.flowRegime}</p>
                                        <div className="space-y-2 text-[11px] leading-relaxed">
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0" />
                                                <p className="text-slate-400"><span className="text-white font-bold">Unit Slope (early time):</span> Wellbore storage effect. C = {formatNumber(ptaResults.c_wbs, 4)} bbl/psi. WBS ends when derivative deviates from 45 degree line.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                                                <p className="text-slate-400"><span className="text-white font-bold">Infinite-Acting Radial Flow (IARF):</span> Flat derivative plateau {'->'} k={formatNumber(ptaResults.kFromDerivative, 1)} mD, Skin={formatNumber(ptaResults.skinValue, 2)}. Primary interpretation zone.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400 mt-1 shrink-0" />
                                                <p className="text-slate-400"><span className="text-white font-bold">Linear Flow (1/2 slope):</span> Indicates fracture flow {'->'} infinite-conductivity hydraulic fracture or channel sand.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
                                                <p className="text-slate-400"><span className="text-white font-bold">Boundary Effects (late-time rise):</span> Sealing fault at distance L = sqrt(0.000264.k.dt_boundary/(phi.mu.Ct)) ft from wellbore.</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
                                                <p className="text-slate-400"><span className="text-white font-bold">Dual Porosity (valley/dip):</span> Naturally fractured reservoir. Storativity ratio omega = (phi.c)_f/(phi.c)_total from dip depth. Interporosity flow coefficient lambda.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================================================================ */}
                    {/* TAB: FLUID SAMPLING */}
                    {/* ================================================================ */}
                    {activeTab === 'sampling' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Thermometer size={14} /> Separator Conditions
                                    </h4>
                                    <InputWithSlider label="Separator Pressure (psi)" value={sepPressure} onChange={setSepPressure} min={50} max={3000} step={10} />
                                    <InputWithSlider label="Separator Temperature (F)" value={sepTemp} onChange={setSepTemp} min={40} max={400} step={1} />
                                    <InputWithSlider label="Separator GOR (scf/STB)" value={gorTest} onChange={setGorTest} min={0} max={20000} step={10} />
                                </div>
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <DropletsIcon size={14} /> Fluid Properties
                                    </h4>
                                    <InputWithSlider label="Oil Gravity (API)" value={oilGravity} onChange={setOilGravity} min={5} max={60} step={0.5} />
                                    <InputWithSlider label="Gas SG (air=1)" value={gasSG} onChange={setGasSG} min={0.5} max={2.0} step={0.01} />
                                    <InputWithSlider label="H2S Content (ppm)" value={h2sPpm} onChange={setH2sPpm} min={0} max={300000} step={10} />
                                    <InputWithSlider label="CO2 Content (%)" value={co2Percent} onChange={setCo2Percent} min={0} max={80} step={0.5} />
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Calculator size={14} /> Sampling Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/30 rounded-2xl p-4 col-span-2">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Recommended Sampling Program</p>
                                            <div className="mt-2 space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                                                <p>- <span className="text-white font-bold">Bottomhole Sample (PVT bomb):</span> Capture single-phase reservoir fluid at p above pb. Choke size to prevent flashing.</p>
                                                <p>- <span className="text-white font-bold">Separator Oil and Gas Sampling:</span> Take oil and gas samples simultaneously at stable separator conditions for recombination.</p>
                                                <p>- <span className="text-white font-bold">Isokinetic Sampling:</span> Ensure representative flowing mixture ratio at sampling point.</p>
                                                <p>- <span className="text-white font-bold">Minimum Samples:</span> 3 bottomhole + 3x (separator oil + separator gas) for statistical validity.</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/30 rounded-2xl p-4">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Pb Estimate (Standing)</p>
                                            <p className="text-xl font-black text-amber-400 mt-1">{formatNumber(samplingResults.pbEstimate, 0)} psi</p>
                                            <p className="text-[10px] text-slate-600">at GOR={formatNumber(samplingResults.separatorGOR, 0)} scf/STB</p>
                                        </div>
                                        <div className="bg-black/30 rounded-2xl p-4">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Bo at Pb (Standing)</p>
                                            <p className="text-xl font-black text-amber-400 mt-1">{formatNumber(samplingResults.boPb, 4)} rb/STB</p>
                                            <p className="text-[10px] text-slate-600">{gorTest} scf/STB GOR</p>
                                        </div>
                                        <div className="bg-black/30 rounded-2xl p-4">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Separator GOR</p>
                                            <p className="text-xl font-black text-white mt-1">{formatNumber(gorTest, 0)}</p>
                                            <p className="text-[10px] text-slate-600">scf/STB</p>
                                        </div>
                                        <div className="bg-black/30 rounded-2xl p-4">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">Oil API</p>
                                            <p className="text-xl font-black text-white mt-1">{formatNumber(oilGravity, 1)} deg</p>
                                            <p className="text-[10px] text-slate-600">{oilGravity > 31.1 ? 'Light oil' : oilGravity > 22.3 ? 'Medium oil' : 'Heavy oil'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "glass-card rounded-3xl p-6 border-white/5",
                                    h2sPpm > 20 || co2Percent > 2 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                                )}>
                                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"
                                        style={{ color: h2sPpm > 20 || co2Percent > 2 ? '#f87171' : '#34d399' }}>
                                        <AlertTriangle size={14} /> Material Selection Advisory
                                    </h4>
                                    <p className="text-sm font-black text-white">{samplingResults.contaminationWarning}</p>
                                    <div className="mt-3 space-y-1 text-[11px] text-slate-400 leading-relaxed">
                                        {h2sPpm > 0 && (
                                            <p>- H2S partial pressure: {formatNumber(h2sPpm * sepPressure / 1e6, 4)} psi -- {h2sPpm * sepPressure / 1e6 > 0.05 ? 'EXCEEDS NACE MR0175 threshold (above 0.05 psi H2S partial pressure)' : 'Within sour service threshold'}</p>
                                        )}
                                        {co2Percent > 0 && (
                                            <p>- CO2 partial pressure: {formatNumber(co2Percent / 100 * sepPressure, 1)} psi -- {co2Percent / 100 * sepPressure > 30 ? 'High corrosion risk: 22Cr duplex or Inconel 625 cladding' : co2Percent / 100 * sepPressure > 7 ? 'Moderate: 13Cr or Super 13Cr' : 'Carbon steel with inhibitor acceptable'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================================================================ */}
                    {/* TAB: SAFETY AND HSE */}
                    {/* ================================================================ */}
                    {activeTab === 'safety' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-amber-500/5">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Real-Time Monitoring Inputs
                                    </h4>
                                    <InputWithSlider label="BS and W (%)" value={bsAndW} onChange={setBsAndW} min={0} max={20} step={0.1} />
                                    <InputWithSlider label="Sand Production (lb/1000 bbl)" value={sandRate} onChange={setSandRate} min={0} max={100} step={0.5} />
                                    <InputWithSlider label="Flaring Volume (Mscf/D)" value={flaringVolume} onChange={setFlareVolume} min={0} max={50000} step={10} />
                                    <InputWithSlider label="Choke dP (psi)" value={chokePressDrop} onChange={setChokePressDrop} min={0} max={10000} step={50} />
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Alarm Dashboard
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'BS and W', value: formatNumber(bsAndW, 1) + '%', alarm: safetyResults.bsAndWAlarm, color: safetyResults.bsAndWColor },
                                            { label: 'Sand Rate', value: formatNumber(sandRate, 1) + ' lb/1000bbl', alarm: safetyResults.sandAlarm, color: safetyResults.sandColor },
                                            { label: 'Flaring', value: formatNumber(flaringVolume, 0) + ' Mscf/D', alarm: safetyResults.flareAlarm, color: safetyResults.flareColor },
                                            { label: 'Choke dP', value: formatNumber(chokePressDrop, 0) + ' psi', alarm: safetyResults.chokeAlarm, color: safetyResults.chokeColor },
                                        ].map(item => (
                                            <div key={item.label} className="bg-black/30 rounded-2xl p-4">
                                                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-black">{item.label}</p>
                                                <p className="text-lg font-black text-white mt-1">{item.value}</p>
                                                <p className={cn("text-[11px] font-bold mt-1", item.color)}>{item.alarm}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap size={14} /> Emergency Response Checklist
                                    </h4>
                                    <div className="space-y-2 text-[11px]">
                                        {[
                                            'Activate ESD (Emergency Shutdown) if H2S above 100 ppm at rig floor',
                                            'Close SSV (Surface Safety Valve) on high-low pilot',
                                            'Divert to slop tank if BS and W above 5% to prevent separator upset',
                                            'Reduce choke if sand above 10 lb/1000 bbl -- risk of erosion/cutout',
                                            'Notify reservoir engineer if PWf drops below bubble point unexpectedly',
                                            'Confirm annulus pressures stable -- monitor for communication',
                                            'Log all operational deviations in IADC daily report',
                                            'Radio silence during well control events -- follow API RP 59',
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-slate-400 leading-relaxed">
                                                <span className="text-amber-400">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}