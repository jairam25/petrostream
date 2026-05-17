/**
 * CrudeDesalterModule — PHASE 6.2
 * Multi-stage electrostatic desalting with live animation, salt removal chemistry,
 * rag layer simulation, demulsifier optimization, and brine effluent management.
 * All calculations are editable and handle industrial-scale values (billions).
 * Designed for oil & gas engineers, consultancies, and university students.
 */
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, Area, ComposedChart, ReferenceLine
} from 'recharts';

// ─── Color palette ───
const C = {
    primary: '#6366f1', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
    dark: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9',
    muted: '#94a3b8', accent: '#06b6d4', oil: '#3b82f6', water: '#06b6d4',
    brine: '#84cc16', emulsion: '#f97316', salt: '#ef4444',
};

// ─── Formatting utilities ───
function fmt(val: number, d = 1): string {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(d) + ' T';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(d) + ' B';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(d) + ' M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(d) + ' K';
    return val.toFixed(d);
}

// ═══════════════════════════════════════════════════════════════════════
// COMPLEX DESALTING CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════

/** Single-stage salt removal (mixing + electrostatic) */
function singleStageSaltRemoval(
    inletSaltPTB: number, washWaterVolPct: number, mixDeltaPsi: number,
    voltage_kV: number, tempF: number, crudeApi: number, demulsifierPpm: number
): { outletSaltPTB: number; removalPct: number; brineSaltConcentration_ppm: number; waterDropletSize_um: number } {
    // Water solubility increases with temperature
    const tempFactor = 1 + (tempF - 100) * 0.003;
    // Mixing efficiency - more dP = better dispersion
    const mixEfficiency = Math.min(1, Math.max(0.3, mixDeltaPsi / 25));
    // Electrostatic coalescence - higher voltage = better, but diminishing returns
    const voltageFactor = Math.min(1, Math.max(0.4, (voltage_kV - 10) / 25));
    // API effect - heavier crudes harder to desalt
    const apiFactor = Math.min(1, Math.max(0.5, (crudeApi - 10) / 35));
    // Demulsifier effect (ppm basis)
    const demulsifierFactor = 1 - Math.min(0.4, demulsifierPpm * 0.02);
    // Wash water dilution factor
    const dilutionFactor = 100 / (100 + washWaterVolPct);
    // Effective removal
    const removalPct = Math.min(99.5, Math.max(60,
        (1 - dilutionFactor * demulsifierFactor) * 100 * mixEfficiency * voltageFactor * apiFactor * tempFactor
    ));
    const outletSaltPTB = inletSaltPTB * (1 - removalPct / 100);
    // Brine concentration
    const saltRemoved_lb = inletSaltPTB - outletSaltPTB;
    const brineWaterVol = washWaterVolPct / 100;
    const brineSaltConcentration_ppm = brineWaterVol > 0 ? (saltRemoved_lb / brineWaterVol) * 100 : 0;
    // Water droplet size (Stokes law approximation)
    const sg = 141.5 / (crudeApi + 131.5);
    const viscosityCp = Math.exp(2 - crudeApi * 0.04) * (1 + (tempF - 100) * 0.005);
    const waterDropletSize_um = Math.max(20, (voltage_kV * 3) / (viscosityCp * (1 - 0.5 * demulsifierFactor)));
    return { outletSaltPTB, removalPct, brineSaltConcentration_ppm, waterDropletSize_um };
}

/** Multi-stage desalting with counter-current wash water */
function multiStageDesalting(
    rawCrudePTB: number, stages: 1 | 2 | 3, washWaterPct: number,
    mixDeltaPsi: number, voltage_kV: number, tempF: number, crudeApi: number,
    demulsifierPpm: number
): {
    stageResults: { stage: number; inletPTB: number; outletPTB: number; removalPct: number; brinePpm: number; washPct: number }[];
    finalOutletPTB: number; overallRemovalPct: number; totalWashWaterPct: number;
    demulsifierCostPerDay: number; corrosionRisk: 'low' | 'medium' | 'high' | 'critical';
} {
    const stageResults: any[] = [];
    let currentPTB = rawCrudePTB;
    const washPerStage = washWaterPct / stages;
    let totalWash = 0;

    for (let s = 1; s <= stages; s++) {
        // Counter-current: later stages get fresher water
        const stageWash = washPerStage * (1 + (s - 1) * 0.2);
        totalWash += stageWash;
        const result = singleStageSaltRemoval(currentPTB, stageWash, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm);
        stageResults.push({
            stage: s, inletPTB: +currentPTB.toFixed(1), outletPTB: +result.outletSaltPTB.toFixed(1),
            removalPct: +result.removalPct.toFixed(1), brinePpm: +result.brineSaltConcentration_ppm.toFixed(0),
            washPct: +stageWash.toFixed(1),
        });
        currentPTB = result.outletSaltPTB;
    }

    const finalOutletPTB = +currentPTB.toFixed(1);
    const overallRemovalPct = rawCrudePTB > 0 ? ((rawCrudePTB - finalOutletPTB) / rawCrudePTB) * 100 : 0;

    // Demulsifier cost (assume $8/lb, 0.001 lb/bbl per ppm)
    const crudeBpd = 250000; // placeholder, passed via config
    const demulsifierCostPerDay = demulsifierPpm * 0.001 * crudeBpd * 8;

    const corrosionRisk = finalOutletPTB < 1 ? 'low' : finalOutletPTB < 5 ? 'medium' : finalOutletPTB < 10 ? 'high' : 'critical';

    return { stageResults, finalOutletPTB, overallRemovalPct: +overallRemovalPct.toFixed(1), totalWashWaterPct: +totalWash.toFixed(1), demulsifierCostPerDay, corrosionRisk };
}

/** HCl formation potential from salt hydrolysis */
function hclFormationPotential(
    saltPTB: number, mgcl2Fraction: number = 0.15, cacl2Fraction: number = 0.1,
    crudeBpd: number = 250000
): { hclProduction_lbPerDay: number; mgcl2Decomposed_lbPerDay: number; cacl2Decomposed_lbPerDay: number; corrosionSeverity: string } {
    // MgCl2 -> MgO + 2HCl (mw: MgCl2=95.2, 2HCl=73)
    // CaCl2 -> CaO + 2HCl (mw: CaCl2=111, 2HCl=73)
    const totalSalts_lbPerDay = saltPTB * (crudeBpd / 1000);
    const mgcl2_lb = totalSalts_lbPerDay * mgcl2Fraction;
    const cacl2_lb = totalSalts_lbPerDay * cacl2Fraction;
    const hclMg = mgcl2_lb * (73 / 95.2);
    const hclCa = cacl2_lb * (73 / 111);
    const totalHcl = hclMg + hclCa;
    const corrosionSeverity = totalHcl > 5000 ? 'Severe' : totalHcl > 2000 ? 'High' : totalHcl > 500 ? 'Moderate' : 'Low';
    return {
        hclProduction_lbPerDay: +totalHcl.toFixed(0),
        mgcl2Decomposed_lbPerDay: +mgcl2_lb.toFixed(0),
        cacl2Decomposed_lbPerDay: +cacl2_lb.toFixed(0),
        corrosionSeverity,
    };
}

/** Water droplet settling velocity (Stokes' law) */
function dropletSettlingVelocity(dropletSize_um: number, oilSg: number, waterSg: number, oilViscosityCp: number, voltage_kV: number): number {
    const g = 9.81;
    const d_m = dropletSize_um / 1e6;
    const deltaRho = (waterSg - oilSg) * 1000;
    const mu_Pa_s = oilViscosityCp / 1000;
    // Stokes settling
    const vStokes = (g * d_m * d_m * deltaRho) / (18 * mu_Pa_s);
    // Electrostatic enhancement
    const eField = voltage_kV * 1000 / 0.15; // V/m (assume 150mm electrode spacing)
    const enhancementFactor = 1 + (eField / 100000) * 0.5;
    return vStokes * 100 * enhancementFactor; // cm/min
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED DESALTER VESSEL (Canvas)
// ═══════════════════════════════════════════════════════════════════════
function AnimatedDesalterVessel({
    voltage_kV, tempF, removalPct, dropletSize_um, ragLayerThickness
}: {
    voltage_kV: number; tempF: number; removalPct: number; dropletSize_um: number; ragLayerThickness: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        let running = true;
        let lastT = 0;
        const animate = (t: number) => {
            if (!running) return;
            const dt = lastT ? (t - lastT) / 1000 : 0.016;
            lastT = t;
            timeRef.current += dt;

            const c = canvasRef.current;
            if (!c) { requestAnimationFrame(animate); return; }
            const ctx = c.getContext('2d');
            if (!ctx) { requestAnimationFrame(animate); return; }
            const W = c.width, H = c.height;

            ctx.clearRect(0, 0, W, H);

            // Vessel body
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(30, 25, W - 60, H - 50, 12);
            ctx.fill();
            ctx.stroke();

            // Crude inlet pipe (left)
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, H * 0.35);
            ctx.lineTo(30, H * 0.35);
            ctx.stroke();
            ctx.fillStyle = '#3b82f6';
            ctx.font = '8px monospace';
            ctx.fillText('CRUDE IN', 2, H * 0.35 - 6);

            // Water phase at bottom
            const waterH = H * 0.15;
            ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.fillRect(32, H - 25 - waterH, W - 64, waterH);

            // Brine outlet
            ctx.strokeStyle = '#84cc16';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(W - 30, H - 25 - waterH / 2);
            ctx.lineTo(W, H - 25 - waterH / 2);
            ctx.stroke();
            ctx.fillStyle = '#84cc16';
            ctx.fillText('BRINE', W - 30, H - 25 - waterH / 2 - 8);

            // Oil phase (main body)
            const oilTop = 27;
            const oilBottom = H - 25 - waterH;
            const oilH = oilBottom - oilTop;

            // Electrostatic field visualization
            const eFieldIntensity = (voltage_kV - 10) / 25;
            for (let y = oilTop + 5; y < oilBottom - 5; y += 12) {
                const alpha = 0.1 + eFieldIntensity * 0.3;
                const pulse = Math.sin(timeRef.current * 4 + y * 0.1) * 0.5 + 0.5;
                ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * (0.5 + pulse * 0.5)})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(50, y);
                ctx.lineTo(W - 50, y);
                ctx.stroke();
            }

            // Electrode bars
            ctx.fillStyle = '#facc15';
            ctx.fillRect(40, oilTop + 10, 6, oilH - 20);
            ctx.fillRect(W - 46, oilTop + 10, 6, oilH - 20);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`${voltage_kV} kV`, W / 2 - 20, oilTop + 20);

            // Water droplets rising and coalescing
            const numDrops = 30;
            for (let i = 0; i < numDrops; i++) {
                const seed = i * 137.5;
                const baseX = 55 + ((seed % 73) / 73) * (W - 110);
                const baseY = oilBottom - 5 - ((seed % 47) / 47) * (oilH - 30);
                const dropSize = dropletSize_um > 200 ? 4 : dropletSize_um > 100 ? 3 : 2;
                const fallSpeed = dropletSize_um / 100 * 0.3;
                const y = baseY - ((timeRef.current * fallSpeed * 10 + seed * 0.3) % (oilH - 20));
                const wobble = Math.sin(timeRef.current * 3 + i) * 3;

                ctx.beginPath();
                ctx.arc(baseX + wobble, y, dropSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // Rag layer (emulsion interface)
            const ragTop = oilBottom - waterH * 0.5 - ragLayerThickness / 2;
            const ragH = Math.max(2, ragLayerThickness);
            const ragAlpha = 0.3 + ragLayerThickness / 40;
            ctx.fillStyle = `rgba(249, 115, 22, ${ragAlpha})`;
            ctx.fillRect(32, ragTop, W - 64, ragH);
            // Rag layer label
            if (ragLayerThickness > 5) {
                ctx.fillStyle = '#f97316';
                ctx.font = '7px monospace';
                ctx.fillText('RAG LAYER', W / 2 + 20, ragTop + ragH / 2 + 3);
            }

            // Desalted crude outlet (top right)
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(W - 30, oilTop + 25);
            ctx.lineTo(W, oilTop + 25);
            ctx.stroke();
            ctx.fillStyle = '#10b981';
            ctx.fillText('DESALTED', W - 30, oilTop + 20);
            ctx.fillText('CRUDE OUT', W - 30, oilTop + 32);

            // Performance indicator
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`Salt Removal: ${removalPct.toFixed(1)}% | Temp: ${tempF}°F`, 40, H - 6);

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { running = false; };
    }, [voltage_kV, tempF, removalPct, dropletSize_um, ragLayerThickness]);

    return <canvas ref={canvasRef} width={520} height={260} className="w-full border border-slate-700 rounded bg-[#0a0f1a]" />;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function CrudeDesalterModule() {
    // ─── Editable State ───
    const [crudeRateBpd, setCrudeRateBpd] = useState(250000);
    const [crudeApi, setCrudeApi] = useState(34);
    const [inletSaltPTB, setInletSaltPTB] = useState(50);
    const [washWaterVolPct, setWashWaterVolPct] = useState(6);
    const [desalterStages, setDesalterStages] = useState<1 | 2 | 3>(2);
    const [mixDeltaPsi, setMixDeltaPsi] = useState(15);
    const [voltage_kV, setVoltage_kV] = useState(25);
    const [tempF, setTempF] = useState(135);
    const [demulsifierPpm, setDemulsifierPpm] = useState(15);
    const [mgcl2Fraction, setMgcl2Fraction] = useState(0.15);
    const [cacl2Fraction, setCacl2Fraction] = useState(0.10);
    const [ragLayerThickness, setRagLayerThickness] = useState(6);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ─── Calculations ───
    const desaltingResult = useMemo(() => {
        return multiStageDesalting(inletSaltPTB, desalterStages, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm);
    }, [inletSaltPTB, desalterStages, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm]);

    const hclResult = useMemo(() => {
        return hclFormationPotential(desaltingResult.finalOutletPTB, mgcl2Fraction, cacl2Fraction, crudeRateBpd);
    }, [desaltingResult.finalOutletPTB, mgcl2Fraction, cacl2Fraction, crudeRateBpd]);

    const oilSg = useMemo(() => 141.5 / (crudeApi + 131.5), [crudeApi]);
    const oilViscosityCp = useMemo(() => Math.exp(2 - crudeApi * 0.04) * (1 + (tempF - 100) * 0.005), [crudeApi, tempF]);
    const settlingVelocity = useMemo(() => {
        const dropletSize = singleStageSaltRemoval(inletSaltPTB, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm).waterDropletSize_um;
        return dropletSettlingVelocity(dropletSize, oilSg, 1.02, oilViscosityCp, voltage_kV);
    }, [inletSaltPTB, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm, oilSg, oilViscosityCp]);

    // Wash water flow rate
    const washWaterBpd = crudeRateBpd * washWaterVolPct / 100;
    const brineBpd = washWaterBpd * 0.9;

    // Cost calculations
    const demulsifierLbPerDay = demulsifierPpm * 0.001 * crudeRateBpd;
    const demulsifierCostPerDay = demulsifierLbPerDay * 8;
    const washWaterCostPerDay = washWaterBpd * 0.15; // $0.15/bbl
    const brineDisposalCostPerDay = brineBpd * 0.80; // $0.80/bbl disposal

    // Corrosion savings (avoiding HCl damage)
    const hclNoDesalting = hclFormationPotential(inletSaltPTB, mgcl2Fraction, cacl2Fraction, crudeRateBpd);
    const hclWithDesalting = hclFormationPotential(desaltingResult.finalOutletPTB, mgcl2Fraction, cacl2Fraction, crudeRateBpd);
    const corrosionSavingsPerDay = (hclNoDesalting.hclProduction_lbPerDay - hclWithDesalting.hclProduction_lbPerDay) * 2.5; // $2.50/lb HCl mitigated

    // Chart data
    const stageChartData = useMemo(() => {
        return desaltingResult.stageResults.map(s => ({
            name: `Stage ${s.stage}`,
            'Inlet Salt (PTB)': s.inletPTB,
            'Outlet Salt (PTB)': s.outletPTB,
            'Removal %': s.removalPct,
            'Brine Conc (ppm)': s.brinePpm / 10,
        }));
    }, [desaltingResult]);

    // Salt curve for sensitivity analysis
    const saltSensitivityData = useMemo(() => {
        const data: { washPct: number; saltPTB: number; removalPct: number }[] = [];
        for (let w = 2; w <= 12; w += 0.5) {
            const result = singleStageSaltRemoval(inletSaltPTB, w, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm);
            data.push({ washPct: +w.toFixed(1), saltPTB: +result.outletSaltPTB.toFixed(1), removalPct: +result.removalPct.toFixed(1) });
        }
        return data;
    }, [inletSaltPTB, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm]);

    // ─── Slider helper ───
    const Slider = ({ label, value, onChange, min, max, step = 1, unit = '', hint = '' }: {
        label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; hint?: string;
    }) => (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="text-cyan-400 font-mono">{fmt(value, 1)}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500" />
            {hint && <div className="text-[10px] text-slate-600 mt-0.5">{hint}</div>}
        </div>
    );

    return (
        <div className="space-y-4 text-slate-200">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-cyan-400">⚡ Crude Desalter — Electrostatic Dehydration & Desalting</h2>
                    <p className="text-xs text-slate-500">Sub-Step 6.2: Salt/water/sediment removal before crude distillation</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold ${desaltingResult.corrosionRisk === 'low' ? 'bg-emerald-900/50 text-emerald-400' :
                    desaltingResult.corrosionRisk === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        desaltingResult.corrosionRisk === 'high' ? 'bg-orange-900/50 text-orange-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                    Corrosion Risk: {desaltingResult.corrosionRisk.toUpperCase()}
                </div>
            </div>

            {/* ─── Animated Vessel + Controls ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <AnimatedDesalterVessel
                        voltage_kV={voltage_kV} tempF={tempF}
                        removalPct={desaltingResult.overallRemovalPct}
                        dropletSize_um={singleStageSaltRemoval(inletSaltPTB, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm).waterDropletSize_um}
                        ragLayerThickness={ragLayerThickness}
                    />
                </div>

                {/* Controls Panel */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-1 max-h-[260px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Operating Parameters</h3>
                    <Slider label="Crude Rate" value={crudeRateBpd} onChange={setCrudeRateBpd} min={10000} max={2000000000} step={1000} unit=" BPD" hint="1K – 2B BPD" />
                    <Slider label="API Gravity" value={crudeApi} onChange={setCrudeApi} min={10} max={55} step={0.1} unit="°API" />
                    <Slider label="Inlet Salt" value={inletSaltPTB} onChange={setInletSaltPTB} min={1} max={500} step={1} unit=" PTB" />
                    <Slider label="Wash Water" value={washWaterVolPct} onChange={setWashWaterVolPct} min={2} max={15} step={0.5} unit=" vol%" />
                    <Slider label="Stages" value={desalterStages} onChange={v => setDesalterStages(v as 1 | 2 | 3)} min={1} max={3} step={1} />
                    <Slider label="Mix ΔP" value={mixDeltaPsi} onChange={setMixDeltaPsi} min={5} max={40} step={1} unit=" psi" />
                    <Slider label="Voltage" value={voltage_kV} onChange={setVoltage_kV} min={12} max={40} step={1} unit=" kV" />
                    <Slider label="Temperature" value={tempF} onChange={setTempF} min={100} max={300} step={5} unit="°F" />
                    <Slider label="Demulsifier" value={demulsifierPpm} onChange={setDemulsifierPpm} min={0} max={50} step={1} unit=" ppm" />
                    <Slider label="Rag Layer" value={ragLayerThickness} onChange={setRagLayerThickness} min={1} max={30} step={1} unit=" mm" />
                </div>
            </div>

            {/* ─── KPI Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                    { label: 'Final Salt', value: `${desaltingResult.finalOutletPTB} PTB`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                    { label: 'Overall Removal', value: `${desaltingResult.overallRemovalPct}%`, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
                    { label: 'Wash Water', value: `${fmt(washWaterBpd, 0)} BPD`, color: 'text-blue-400', bg: 'bg-blue-900/30' },
                    { label: 'Brine Flow', value: `${fmt(brineBpd, 0)} BPD`, color: 'text-lime-400', bg: 'bg-lime-900/30' },
                    { label: 'HCl w/ Desalt.', value: `${fmt(hclResult.hclProduction_lbPerDay, 0)} lb/d`, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                    { label: 'Drop Size', value: `${fmt(singleStageSaltRemoval(inletSaltPTB, washWaterVolPct, mixDeltaPsi, voltage_kV, tempF, crudeApi, demulsifierPpm).waterDropletSize_um, 0)} µm`, color: 'text-violet-400', bg: 'bg-violet-900/30' },
                    { label: 'Settling Vel.', value: `${settlingVelocity.toFixed(2)} cm/min`, color: 'text-pink-400', bg: 'bg-pink-900/30' },
                    { label: 'Demuls. $/d', value: `$${fmt(demulsifierCostPerDay, 0)}`, color: 'text-amber-400', bg: 'bg-amber-900/30' },
                ].map((kpi, i) => (
                    <div key={i} className={`${kpi.bg} rounded p-2 text-center border border-slate-700/50`}>
                        <div className="text-[10px] text-slate-400">{kpi.label}</div>
                        <div className={`font-mono font-bold text-sm ${kpi.color}`}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* ─── Stage Performance Chart ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Stage-by-Stage Salt Removal</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={stageChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} label={{ value: 'Salt (PTB)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} label={{ value: 'Removal %', angle: 90, position: 'insideRight', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px' }} />
                            <Bar yAxisId="left" dataKey="Inlet Salt (PTB)" fill="#ef4444" opacity={0.6} barSize={30} />
                            <Bar yAxisId="left" dataKey="Outlet Salt (PTB)" fill="#10b981" opacity={0.8} barSize={30} />
                            <Line yAxisId="right" type="monotone" dataKey="Removal %" stroke="#facc15" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Salt vs. Wash Water Sensitivity</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={saltSensitivityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="washPct" stroke="#94a3b8" fontSize={10} label={{ value: 'Wash Water (vol%)', position: 'bottom', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Outlet Salt (PTB)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px' }} />
                            <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target <5 PTB', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
                            <ReferenceLine y={1} stroke="#10b981" strokeDasharray="4 4" label={{ value: '<1 PTB', position: 'right', fill: '#10b981', fontSize: 10 }} />
                            <Area type="monotone" dataKey="saltPTB" fill="rgba(239, 68, 68, 0.1)" stroke="none" />
                            <Line type="monotone" dataKey="saltPTB" stroke="#ef4444" strokeWidth={2} dot={false} name="Outlet Salt (PTB)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Advanced: HCl & Corrosion Chemistry ─── */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                    {showAdvanced ? '\u25BC' : '\u25B6'} Advanced: HCl Formation & Corrosion Chemistry
                </button>
                {showAdvanced && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* HCl Chemistry */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-red-400 mb-2">HCl Formation from Salt Hydrolysis</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">MgCl₂ → MgO + 2HCl</span><span className="text-red-300">{fmt(hclResult.mgcl2Decomposed_lbPerDay, 0)} lb/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">CaCl₂ → CaO + 2HCl</span><span className="text-red-300">{fmt(hclResult.cacl2Decomposed_lbPerDay, 0)} lb/d</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-300 font-bold">Total HCl Produced</span><span className="text-red-400 font-bold">{fmt(hclResult.hclProduction_lbPerDay, 0)} lb/day</span></div>
                                <div className="flex justify-between"><span className="text-slate-300">Corrosion Severity</span><span className={hclResult.corrosionSeverity === 'Low' ? 'text-emerald-400' : hclResult.corrosionSeverity === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}>{hclResult.corrosionSeverity}</span></div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <Slider label="MgCl₂ Fraction" value={mgcl2Fraction} onChange={setMgcl2Fraction} min={0.05} max={0.4} step={0.01} hint="Fraction of salts as MgCl₂" />
                                <Slider label="CaCl₂ Fraction" value={cacl2Fraction} onChange={setCacl2Fraction} min={0.02} max={0.3} step={0.01} hint="Fraction of salts as CaCl₂" />
                            </div>
                        </div>

                        {/* Economics */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-amber-400 mb-2">Desalter Economics</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Demulsifier Usage</span><span>{fmt(demulsifierLbPerDay, 0)} lb/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Demulsifier Cost</span><span className="text-amber-300">${fmt(demulsifierCostPerDay, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Wash Water Cost</span><span className="text-blue-300">${fmt(washWaterCostPerDay, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Brine Disposal Cost</span><span className="text-lime-300">${fmt(brineDisposalCostPerDay, 0)}/d</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-300 font-bold">Total Operating Cost</span><span className="text-amber-400 font-bold">${fmt(demulsifierCostPerDay + washWaterCostPerDay + brineDisposalCostPerDay, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-emerald-300">Corrosion Savings</span><span className="text-emerald-400">${fmt(corrosionSavingsPerDay, 0)}/d</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-200 font-bold">Net Benefit</span><span className="text-cyan-400 font-bold">${fmt(corrosionSavingsPerDay - demulsifierCostPerDay - washWaterCostPerDay - brineDisposalCostPerDay, 0)}/d</span></div>
                            </div>
                        </div>

                        {/* Water Chemistry */}
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-blue-400 mb-2">Brine Effluent Quality</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                {desaltingResult.stageResults.map(s => (
                                    <div key={s.stage} className="flex justify-between">
                                        <span className="text-slate-400">Stage {s.stage} Brine</span>
                                        <span className="text-lime-300">{fmt(s.brinePpm, 0)} ppm salt</span>
                                    </div>
                                ))}
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-400">Oil in Brine</span><span>{ragLayerThickness > 10 ? '{' > '}100' : '<50'} ppm</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">pH Estimate</span><span>{tempF > 250 ? '5.5-6.5' : '6.5-7.5'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Disposal Class</span><span className="text-lime-300">Class II Injection Well</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Equation Reference ─── */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                Salt Removal = f(dilution × mixing × voltage × API × temp){' '}
                | MgCl₂ + H₂O → MgO + 2HCl (T {'>'} 350°C){' '}
                | Stokes Settling: v = g·d²·Δρ/(18·μ){' '}
                | Electrostatic Enhancement: E = V/d{' '}
                | Demulsifier: reduces interfacial tension, promotes coalescence
            </div>
        </div>
    );
}