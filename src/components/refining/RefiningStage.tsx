import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    InputWithSlider, DataRow, SectionHeader
} from '../SharedUI';
import {
    apiGravity, sgFromAPI, sulfurClass, tanClass, daysOfInventory,
    blendApiGravity, blendSulfur, generateTBPCurve, tbpYieldAtTemp,
    saltRemovalEfficiency, multiStageDesalting, washWaterRate, brineSaltConcentration, demulsifierCost,
    furnaceDuty, furnaceEfficiency, crudeDistillationYields, vacuumDistillationYields,
    trayFloodingFactor, pumpAroundDuty,
    nhtSulfurRemoval, reformerYields, isomerateRON, alkylateYield, blendRON, blendRVP,
    dieselHdsOutletSulfur, cetaneIndex, jetFreezePoint, smokePointMM, blendCetane, hfrrWearScar,
    fccYields, hydrocrackerYields, cokerYields, visbreakerConversion, sdaDAOYield,
    smrHydrogenProduction, hydrogenBalance, psaPerformance,
    sulfurToSRU, clausEfficiency, so2Emissions, refineryCO2Emissions, sourWaterStripper,
    viscosityIndex, baseOilGroup, solventDewaxing, asphaltBlendIndex, airBlownAsphalt,
    boilerEfficiency, wasteHeatSteam, coolingTowerEvaporation, steamTurbinePower, gasTurbineCHP, energyIntensityIndex,
    refineryGrossMargin, crackSpread, nelsonComplexityIndex, unitOPEX, turnaroundEconomics,
    tankUllage, truckRackThroughput, pipelineBatchInterface, marineLoadingRate, additiveInjection,
    runRefinerySimulation, RefineryConfig, RefinerySimResult
} from '../../lib/refining';
import { useMidstream, useRefining, useExploration, useProduction, useStoreActions } from '../../store/hooks';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getRefiningSample } from '../../lib/sampleData';

// ══════════════════════════════════════════════════════════════
// LARGE NUMBER FORMATTING UTILITY
// ══════════════════════════════════════════════════════════════
function fmtLarge(val: number, decimals = 1): string {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(decimals) + ' T';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(decimals) + ' B';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(decimals) + ' M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(decimals) + ' K';
    return val.toFixed(decimals);
}
function fmtBbl(val: number): string { return fmtLarge(val, 0) + ' BPD'; }
function fmtMoney(val: number): string { return '$' + fmtLarge(val, 2); }
function fmtPct(val: number): string { return val.toFixed(1) + '%'; }

// ══════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ══════════════════════════════════════════════════════════════
const defaultConfig: RefineryConfig = {
    crudeRateBpd: 250000,
    crudeApi: 34,
    crudeSulfurWtPct: 1.2,
    crudeTan: 0.3,
    crudeCCRWtPct: 3.5,
    crudeCostPerBbl: 78,
    desalterStages: 2,
    desalterTempF: 135,
    washWaterVolPct: 6,
    inletSaltPTB: 50,
    furnaceOutletF: 670,
    cduTopPressurePsig: 20,
    vduFurnaceOutletF: 780,
    vacuumMmHg: 30,
    reformerSeverity: 'medium',
    isoRecycleRatio: 0.5,
    fccRiserOutletF: 995,
    fccCatToOilRatio: 7,
    fccZsm5WtPct: 1.0,
    hcReactorTempF: 740,
    hcPressurePsig: 2400,
    hcRecycleMode: 'once-through',
    cokerDrumTempF: 860,
    cokerDrumPressurePsig: 30,
    smrCapacityMmscfd: 40,
    powerCostPerMWh: 55,
    fuelGasCostPerMMBtu: 4.5,
    gasolinePricePerBbl: 115,
    dieselPricePerBbl: 125,
    jetPricePerBbl: 122,
    fuelOilPricePerBbl: 72,
    lpgPricePerBbl: 52,
    cokePricePerTon: 85,
    sulfurPricePerLt: 95,
};

// ══════════════════════════════════════════════════════════════
// ANIMATED CANVAS HOOK
// ══════════════════════════════════════════════════════════════
function useAnimationFrame(callback: (dt: number) => void, active: boolean = true) {
    const savedCallback = useRef(callback);
    const frameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => { savedCallback.current = callback; }, [callback]);

    useEffect(() => {
        if (!active) return;
        let running = true;
        const animate = (time: number) => {
            if (!running) return;
            const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
            lastTimeRef.current = time;
            savedCallback.current(Math.min(dt, 0.1));
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => { running = false; cancelAnimationFrame(frameRef.current); };
    }, [active]);
}

// ══════════════════════════════════════════════════════════════
// ANIMATED TBP CURVE WITH LIVE INTERPOLATION
// ══════════════════════════════════════════════════════════════
function AnimatedTBPChart({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useAnimationFrame((dt) => {
        timeRef.current += dt;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height, M = { l: 50, r: 20, t: 30, b: 35 };
        const pw = W - M.l - M.r, ph = H - M.t - M.b;

        ctx.clearRect(0, 0, W, H);

        // Background grid
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
        for (let yi = 0; yi <= 100; yi += 20) {
            const y = M.t + ph - (yi / 100) * ph;
            ctx.beginPath(); ctx.moveTo(M.l, y); ctx.lineTo(W - M.r, y); ctx.stroke();
        }
        for (let ti = 200; ti <= 1200; ti += 200) {
            const x = M.l + ((ti - 100) / 1100) * pw;
            ctx.beginPath(); ctx.moveTo(x, M.t); ctx.lineTo(x, M.t + ph); ctx.stroke();
        }

        // TBP curve
        const t50 = 450 + config.crudeApi * 4;
        const t100 = 950 + config.crudeApi * 3;
        const curve = generateTBPCurve(t50, t100, 120);

        // Draw filled area
        ctx.beginPath();
        curve.forEach((p, i) => {
            const x = M.l + ((p.tempF - 100) / 1100) * pw;
            const y = M.t + ph - (p.yieldPct / 100) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(M.l + ((curve[curve.length - 1].tempF - 100) / 1100) * pw, M.t + ph);
        ctx.lineTo(M.l + ((curve[0].tempF - 100) / 1100) * pw, M.t + ph);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, M.t, 0, M.t + ph);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw line
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        curve.forEach((p, i) => {
            const x = M.l + ((p.tempF - 100) / 1100) * pw;
            const y = M.t + ph - (p.yieldPct / 100) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw cut-point lines from distillation yields
        const cutPoints = [
            { temp: 180, label: 'LN', color: '#f59e0b' },
            { temp: 300, label: 'HN', color: '#d97706' },
            { temp: 430, label: 'KERO', color: '#10b981' },
            { temp: 550, label: 'DSL', color: '#3b82f6' },
            { temp: 650, label: 'HGO', color: '#8b5cf6' },
        ];
        cutPoints.forEach(cp => {
            const yld = tbpYieldAtTemp(cp.temp, t50, t100);
            const x = M.l + ((cp.temp - 100) / 1100) * pw;
            const y = M.t + ph - (yld / 100) * ph;
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = cp.color; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, M.t + ph); ctx.stroke();
            ctx.setLineDash([]);
            // label
            ctx.fillStyle = cp.color; ctx.font = 'bold 9px monospace';
            ctx.fillText(cp.label, Math.min(x + 3, W - 50), y - 6);
        });

        // Pulsing marker at furnace outlet temperature
        const pulseX = M.l + ((config.furnaceOutletF - 100) / 1100) * pw;
        const furnaceYld = tbpYieldAtTemp(config.furnaceOutletF, t50, t100);
        const pulseY = M.t + ph - (furnaceYld / 100) * ph;
        const pulseR = 4 + Math.sin(timeRef.current * 3) * 2;
        ctx.beginPath(); ctx.arc(pulseX, pulseY, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; ctx.fill();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px monospace';
        ctx.fillText('FURNACE\n' + config.furnaceOutletF + '°F', pulseX + 8, pulseY - 8);

        // Axis labels
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
        ctx.fillText('Temperature (°F)', M.l + pw / 2 - 50, H - 5);
        ctx.save();
        ctx.translate(14, M.t + ph / 2 + 30);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Cumulative Yield (%)', 0, 0);
        ctx.restore();

        // Legend
        ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 11px monospace';
        ctx.fillText(`API: ${config.crudeApi}°  S: ${config.crudeSulfurWtPct}wt%  TAN: ${config.crudeTan}`, M.l, 16);

        // Yield tick marks on curve
        [10, 30, 50, 70, 90].forEach(yp => {
            const idx = curve.findIndex(p => p.yieldPct >= yp);
            if (idx >= 0) {
                const pt = curve[idx];
                const tx = M.l + ((pt.tempF - 100) / 1100) * pw;
                const ty = M.t + ph - (pt.yieldPct / 100) * ph;
                ctx.fillStyle = '#64748b'; ctx.font = '8px monospace';
                ctx.fillText(yp + '%', tx + 4, ty - 3);
            }
        });
    }, true);

    return <canvas ref={canvasRef} width={520} height={280} className="w-full border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// ANIMATED REFINERY PROCESS FLOW DIAGRAM
// ══════════════════════════════════════════════════════════════
function AnimatedProcessFlow({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    interface FlowBox { id: string; x: number; y: number; w: number; h: number; label: string; color: string; }
    interface FlowEdge { from: string; to: string; rate: number; unit: string; color?: string; }

    const boxes: FlowBox[] = [
        { id: 'crude', x: 10, y: 8, w: 60, h: 22, label: 'Crude Tank', color: '#1e40af' },
        { id: 'desalt', x: 85, y: 8, w: 58, h: 22, label: 'Desalter', color: '#2563eb' },
        { id: 'cdu', x: 158, y: 8, w: 55, h: 22, label: 'CDU', color: '#0d9488' },
        { id: 'vdu', x: 228, y: 8, w: 55, h: 22, label: 'VDU', color: '#0f766e' },
        { id: 'nht', x: 158, y: 42, w: 55, h: 22, label: 'NHT', color: '#ca8a04' },
        { id: 'reformer', x: 228, y: 42, w: 55, h: 22, label: 'Reformer', color: '#eab308' },
        { id: 'iso', x: 85, y: 42, w: 58, h: 22, label: 'Isomeriz.', color: '#fbbf24' },
        { id: 'alky', x: 10, y: 42, w: 60, h: 22, label: 'Alkylation', color: '#f59e0b' },
        { id: 'dht', x: 10, y: 76, w: 60, h: 22, label: 'Diesel HDT', color: '#16a34a' },
        { id: 'fcc', x: 85, y: 76, w: 58, h: 22, label: 'FCC', color: '#dc2626' },
        { id: 'hc', x: 158, y: 76, w: 55, h: 22, label: 'Hydrocrkr', color: '#7c3aed' },
        { id: 'coker', x: 228, y: 76, w: 55, h: 22, label: 'Coker', color: '#9333ea' },
        { id: 'smr', x: 10, y: 110, w: 60, h: 22, label: 'H₂ Plant', color: '#0891b2' },
        { id: 'sru', x: 85, y: 110, w: 58, h: 22, label: 'Sulfur Rec', color: '#fbbf24' },
        { id: 'blend', x: 158, y: 110, w: 125, h: 22, label: 'Product Blending', color: '#0891b2' },
        { id: 'storage', x: 10, y: 144, w: 273, h: 18, label: 'Product Storage & Dispatch (Pipeline / Marine / Rail / Truck)', color: '#475569' },
    ];

    const edges: FlowEdge[] = useMemo(() => [
        { from: 'crude', to: 'desalt', rate: config.crudeRateBpd, unit: 'BPD', color: '#3b82f6' },
        { from: 'desalt', to: 'cdu', rate: config.crudeRateBpd * 0.998, unit: 'BPD', color: '#3b82f6' },
        { from: 'cdu', to: 'vdu', rate: sim.cduYields?.atmosResidue || 80000, unit: 'BPD', color: '#14b8a6' },
        { from: 'cdu', to: 'nht', rate: sim.cduYields?.heavyNaphtha || 35000, unit: 'BPD', color: '#fbbf24' },
        { from: 'cdu', to: 'dht', rate: sim.cduYields?.diesel || 45000, unit: 'BPD', color: '#22c55e' },
        { from: 'nht', to: 'reformer', rate: sim.cduYields?.heavyNaphtha || 32000, unit: 'BPD', color: '#eab308' },
        { from: 'cdu', to: 'iso', rate: sim.cduYields?.lightNaphtha || 18000, unit: 'BPD', color: '#fbbf24' },
        { from: 'fcc', to: 'alky', rate: sim.fcc?.propyleneBpd || 8000, unit: 'BPD', color: '#f59e0b' },
        { from: 'vdu', to: 'fcc', rate: sim.vduYields?.lvgo || 28000, unit: 'BPD', color: '#ef4444' },
        { from: 'vdu', to: 'hc', rate: sim.vduYields?.hvgo || 22000, unit: 'BPD', color: '#a855f7' },
        { from: 'vdu', to: 'coker', rate: sim.vduYields?.vacResidue || 15000, unit: 'BPD', color: '#9333ea' },
        { from: 'smr', to: 'dht', rate: sim.smr?.h2ProductionMmscfd || 15, unit: 'MMSCFD', color: '#06b6d4' },
        { from: 'smr', to: 'hc', rate: sim.smr?.h2ProductionMmscfd || 20, unit: 'MMSCFD', color: '#06b6d4' },
        { from: 'reformer', to: 'blend', rate: sim.reformer?.reformateBpd || 25000, unit: 'BPD', color: '#eab308' },
        { from: 'iso', to: 'blend', rate: 14000, unit: 'BPD', color: '#fbbf24' },
        { from: 'alky', to: 'blend', rate: sim.alkylate?.alkylateBpd || 9000, unit: 'BPD', color: '#f59e0b' },
        { from: 'dht', to: 'blend', rate: sim.cduYields?.diesel || 43000, unit: 'BPD', color: '#22c55e' },
        { from: 'fcc', to: 'blend', rate: sim.fcc?.gasolineBpd || 45000, unit: 'BPD', color: '#ef4444' },
        { from: 'hc', to: 'blend', rate: sim.hc?.dieselBpd || 28000, unit: 'BPD', color: '#a855f7' },
        { from: 'coker', to: 'blend', rate: sim.coker?.naphthaBpd || 5000, unit: 'BPD', color: '#9333ea' },
        { from: 'blend', to: 'storage', rate: sim.totalProducts || 230000, unit: 'BPD', color: '#22d3ee' },
    ], [config, sim]);

    useAnimationFrame((dt) => {
        timeRef.current += dt;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height;
        ctx.clearRect(0, 0, W, H);

        // Draw edges with animated flow dots
        edges.forEach(edge => {
            const fb = boxes.find(b => b.id === edge.from);
            const tb = boxes.find(b => b.id === edge.to);
            if (!fb || !tb) return;
            const x1 = fb.x + fb.w, y1 = fb.y + fb.h / 2;
            const x2 = tb.x, y2 = tb.y + tb.h / 2;
            const mx = (x1 + x2) / 2;

            // Bezier control points
            const cpx = mx, cpy1 = y1, cpy2 = y2;

            ctx.strokeStyle = edge.color || '#64748b';
            ctx.lineWidth = Math.max(0.8, Math.min(3, edge.rate / 40000));
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(cpx, cpy1, cpx, cpy2, x2, y2);
            ctx.stroke();

            // Animated flow dots
            const numDots = 3;
            for (let d = 0; d < numDots; d++) {
                const t = ((timeRef.current * 0.6 + d / numDots) % 1 + 1) % 1;
                const px = Math.pow(1 - t, 3) * x1 + 3 * Math.pow(1 - t, 2) * t * cpx + 3 * (1 - t) * t * t * cpx + t * t * t * x2;
                const py = Math.pow(1 - t, 3) * y1 + 3 * Math.pow(1 - t, 2) * t * cpy1 + 3 * (1 - t) * t * t * cpy2 + t * t * t * y2;
                ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = edge.color || '#64748b';
                ctx.fill();
            }

            // Rate label at midpoint
            const mt = 0.5;
            const mx2 = Math.pow(1 - mt, 3) * x1 + 3 * Math.pow(1 - mt, 2) * mt * cpx + 3 * (1 - mt) * mt * mt * cpx + mt * mt * mt * x2;
            const my2 = Math.pow(1 - mt, 3) * y1 + 3 * Math.pow(1 - mt, 2) * mt * cpy1 + 3 * (1 - mt) * mt * mt * cpy2 + mt * mt * mt * y2;
            if (edge.rate > 5000) {
                ctx.fillStyle = '#64748b';
                ctx.font = '7px monospace';
                ctx.fillText(fmtLarge(edge.rate, 0), mx2 - 10, my2 - 4);
            }
        });

        // Draw boxes
        boxes.forEach(b => {
            const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            grad.addColorStop(0, b.color);
            grad.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = grad;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 3);
            ctx.textAlign = 'left';
        });
    }, true);

    return <canvas ref={canvasRef} width={310} height={172} className="w-full border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// DYNAMIC YIELD PIE CHART
// ══════════════════════════════════════════════════════════════
function YieldPieChart({ data, title, width = 280, height = 220 }: {
    data: { label: string; value: number; color: string }[];
    title: string; width?: number; height?: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotRef = useRef(0);

    useAnimationFrame((dt) => {
        rotRef.current += dt * 0.3;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height;
        const cx = W * 0.38, cy = H * 0.5, r = Math.min(cx - 20, cy - 30);

        ctx.clearRect(0, 0, W, H);

        const total = data.reduce((s, d) => s + d.value, 0);
        if (total <= 0) return;

        let angle = -Math.PI / 2 + rotRef.current * 0.1;
        data.forEach(d => {
            const slice = (d.value / total) * Math.PI * 2;
            if (slice < 0.01) { angle += slice; return; }

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, angle, angle + slice);
            ctx.closePath();
            ctx.fillStyle = d.color;
            ctx.fill();
            ctx.strokeStyle = '#0a0f1a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label on slice
            if (d.value / total > 0.04) {
                const midAngle = angle + slice / 2;
                ctx.fillStyle = '#f1f5f9';
                ctx.font = 'bold 9px monospace';
                const lx = cx + Math.cos(midAngle) * r * 0.65;
                const ly = cy + Math.sin(midAngle) * r * 0.65;
                ctx.fillText(fmtPct(d.value / total * 100), lx - 12, ly + 3);
            }

            angle += slice;
        });

        // Legend
        ctx.font = '9px monospace';
        const lx = cx + r + 15;
        data.forEach((d, i) => {
            const ly = 25 + i * 17;
            ctx.fillStyle = d.color;
            ctx.fillRect(lx, ly - 7, 10, 10);
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`${d.label}`, lx + 14, ly + 1);
        });

        // Title
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(title, cx - 30, 14);
    }, true);

    return <canvas ref={canvasRef} width={width} height={height} className="border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// TOWER TEMPERATURE PROFILE (ANIMATED)
// ══════════════════════════════════════════════════════════════
function TowerTemperatureProfile({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useAnimationFrame((dt) => {
        timeRef.current += dt;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height, M = { l: 45, r: 15, t: 25, b: 30 };
        const pw = W - M.l - M.r, ph = H - M.t - M.b;

        ctx.clearRect(0, 0, W, H);

        // Tower outline
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.strokeRect(M.l + pw * 0.3, M.t, pw * 0.4, ph);

        // Tray lines
        const numTrays = 40;
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
        for (let i = 0; i <= numTrays; i++) {
            const y = M.t + (i / numTrays) * ph;
            ctx.beginPath();
            ctx.moveTo(M.l + pw * 0.3, y);
            ctx.lineTo(M.l + pw * 0.7, y);
            ctx.stroke();
        }

        // Temperature profile curve
        const topTemp = 120 + config.crudeApi * 1.5;

        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        for (let i = 0; i <= numTrays; i++) {
            const frac = i / numTrays;
            // Non-linear temperature profile: cool at top, hot at bottom
            const temp = topTemp + (config.furnaceOutletF - topTemp) * Math.pow(frac, 1.5);
            const x = M.l + pw * 0.3 + pw * 0.4 * (1 - (temp - topTemp) / (config.furnaceOutletF - topTemp));
            const y = M.t + (1 - frac) * ph;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Temperature labels
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px monospace';
        ctx.fillText(`${topTemp.toFixed(0)}°F`, M.l + pw * 0.7 + 5, M.t + 5);
        ctx.fillText(`${config.furnaceOutletF}°F`, M.l + pw * 0.3 - 45, M.t + ph - 5);

        // Product draw zones
        const zones = [
            { frac: 0.05, label: 'Gas', color: '#94a3b8' },
            { frac: 0.12, label: 'Light Naphtha', color: '#fbbf24' },
            { frac: 0.25, label: 'Heavy Naphtha', color: '#f59e0b' },
            { frac: 0.4, label: 'Kerosene', color: '#10b981' },
            { frac: 0.58, label: 'Diesel', color: '#3b82f6' },
            { frac: 0.78, label: 'HGO', color: '#8b5cf6' },
            { frac: 0.92, label: 'Atm Residue', color: '#1e293b' },
        ];

        zones.forEach(z => {
            const y = M.t + (1 - z.frac) * ph;
            const px = M.l + pw * 0.7 + 8;
            ctx.fillStyle = z.color;
            ctx.font = '8px monospace';
            ctx.fillText(z.label, px, y + 3);
            // Draw line from tower to label
            ctx.strokeStyle = z.color;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(M.l + pw * 0.7, y);
            ctx.lineTo(px - 2, y);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Axis
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
        ctx.fillText('Tray Level →', M.l + pw * 0.3 + pw * 0.2 - 25, H - 5);
        ctx.save();
        ctx.translate(12, M.t + ph / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Temperature (°F) →', 0, 0);
        ctx.restore();
    }, true);

    return <canvas ref={canvasRef} width={380} height={240} className="border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// ECONOMIC WATERFALL CHART
// ══════════════════════════════════════════════════════════════
function EconomicWaterfall({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height, M = { l: 90, r: 30, t: 25, b: 25 };
        const pw = W - M.l - M.r, ph = H - M.t - M.b;

        ctx.clearRect(0, 0, W, H);

        const items = [
            { label: 'Products', value: sim.margin.totalRevenue / 1e9, color: '#22c55e', start: 0 },
            { label: 'Crude Cost', value: -sim.margin.totalCrudeCost / 1e9, color: '#ef4444', start: 0 },
            { label: 'Energy', value: -(sim.margin.totalOpCost * 0.5) / 1e9, color: '#f59e0b', start: 0 },
            { label: 'Cat/Chem', value: -(sim.margin.totalOpCost * 0.15) / 1e9, color: '#fbbf24', start: 0 },
            { label: 'Maintenance', value: -(sim.margin.totalOpCost * 0.2) / 1e9, color: '#a855f7', start: 0 },
            { label: 'Personnel', value: -(sim.margin.totalOpCost * 0.15) / 1e9, color: '#3b82f6', start: 0 },
            { label: 'Gross Margin', value: sim.margin.grossMargin / 1e9, color: '#06b6d4', start: 0 },
        ];

        // Calculate running totals for waterfall
        let running = 0;
        const bars: { label: string; bottom: number; top: number; color: string }[] = [];

        items.forEach((item, i) => {
            if (item.value >= 0) {
                bars.push({ label: item.label, bottom: running, top: running + item.value, color: item.color });
                running += item.value;
            } else {
                bars.push({ label: item.label, bottom: running + item.value, top: running, color: item.color });
                running += item.value;
            }
        });

        const maxVal = Math.max(...bars.map(b => b.top), ...bars.map(b => -b.bottom), 1) * 1.15;
        const scale = ph / maxVal;
        const barW = pw / (bars.length + 1);
        const gap = barW * 0.25;

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        for (let v = 0; v <= maxVal; v += maxVal / 5) {
            const y = M.t + ph - v * scale;
            ctx.beginPath(); ctx.moveTo(M.l, y); ctx.lineTo(W - M.r, y); ctx.stroke();
            ctx.fillStyle = '#64748b';
            ctx.font = '8px monospace';
            ctx.fillText('$' + v.toFixed(1) + 'B', M.l - 75, y + 3);
        }

        bars.forEach((b, i) => {
            const x = M.l + (i + 1) * barW - barW / 2 + gap / 2;
            const barH = Math.abs(b.top - b.bottom) * scale;
            const barY = M.t + ph - Math.max(b.top, b.bottom) * scale;

            // Bar with gradient
            const grad = ctx.createLinearGradient(x, barY, x, barY + barH);
            grad.addColorStop(0, b.color);
            grad.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - barW / 2 + gap / 2, barY, barW - gap, Math.max(barH, 2));

            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - barW / 2 + gap / 2, barY, barW - gap, Math.max(barH, 2));

            // Value label
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 8px monospace';
            const valText = '$' + Math.abs(b.top - b.bottom).toFixed(2) + 'B';
            ctx.fillText(valText, x - 22, Math.min(barY - 4, barY + barH - 4));

            // Category label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.label, x, M.t + ph + 14);
            ctx.textAlign = 'left';

            // Connecting line
            if (i > 0) {
                const prev = bars[i - 1];
                const prevY = M.t + ph - prev.top * scale;
                const currY = M.t + ph - b.bottom * scale;
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(x - barW / 2 + gap / 2 - gap, prevY);
                ctx.lineTo(x - barW / 2 + gap / 2, currY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });

        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Refinery Margin Waterfall ($B/Year)', M.l + 10, 14);
    }, [config, sim]);

    return <canvas ref={canvasRef} width={480} height={240} className="w-full border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// HYDROGEN BALANCE SANKEY-INSPIRED FLOW DIAGRAM
// ══════════════════════════════════════════════════════════════
function HydrogenSankey({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height;

        ctx.clearRect(0, 0, W, H);

        const totalProd = sim.h2Prod || 55;
        const totalCons = (sim.h2Bal?.totalConsumption) || 50;
        const maxH2 = Math.max(totalProd, totalCons, 1);

        // Sources (left side)
        const sources = [
            { label: 'SMR Plant', value: sim.smr?.h2ProductionMmscfd || 35, color: '#06b6d4' },
            { label: 'Catalytic Reformer', value: sim.reformer?.hydrogenMmscfd || 18, color: '#22c55e' },
            { label: 'PSA Recovery', value: totalProd - (sim.smr?.h2ProductionMmscfd || 35) - (sim.reformer?.hydrogenMmscfd || 18), color: '#a855f7' },
        ].filter(s => s.value > 0.5);

        // Consumers (right side)
        const consumers = [
            { label: 'Diesel HDT', value: 15, color: '#f59e0b' },
            { label: 'Naphtha HDT', value: 5, color: '#fbbf24' },
            { label: 'Hydrocracker', value: sim.hc?.h2ConsumptionScfBbl ? sim.hc.h2ConsumptionScfBbl * (sim.hc?.dieselBpd || 25000) / 1e6 : 18, color: '#ef4444' },
            { label: 'Isomerization', value: 3, color: '#8b5cf6' },
            { label: 'Other HDT', value: totalCons - 15 - 5 - 18 - 3, color: '#64748b' },
        ].filter(c => c.value > 0.5);

        const srcYStart = 35;
        const srcSpacing = Math.min(35, (H - 80) / sources.length);
        const consYStart = 35;
        const consSpacing = Math.min(35, (H - 80) / consumers.length);

        // Draw headers
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('H₂ PRODUCTION', 15, 18);
        ctx.fillText('H₂ CONSUMPTION', W - 160, 18);

        // Source bars
        sources.forEach((s, i) => {
            const barW = 120 * (s.value / maxH2);
            const y = srcYStart + i * srcSpacing;
            const grad = ctx.createLinearGradient(0, y, barW, y);
            grad.addColorStop(0, s.color);
            grad.addColorStop(1, 'rgba(0,0,0,0.2)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, y, barW, 16);
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(s.label, 4, y + 11);
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(s.value.toFixed(1) + ' MMSCFD', barW + 4, y + 11);
        });

        // Consumer bars (reverse direction)
        consumers.forEach((c, i) => {
            const barW = 120 * (c.value / maxH2);
            const y = consYStart + i * consSpacing;
            const x = W - barW;
            const grad = ctx.createLinearGradient(x, y, W, y);
            grad.addColorStop(0, 'rgba(0,0,0,0.2)');
            grad.addColorStop(1, c.color);
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barW, 16);
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(c.label, x + 4, y + 11);
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(c.value.toFixed(1) + ' MMSCFD', x - 4, y + 11);
            ctx.textAlign = 'left';
        });

        // Balance indicator
        const balY = H - 20;
        const netBal = totalProd - totalCons;
        ctx.fillStyle = netBal >= 0 ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(
            `NET: ${netBal >= 0 ? '+' : ''}${netBal.toFixed(1)} MMSCFD ${netBal >= 0 ? 'SURPLUS' : 'DEFICIT'}`,
            W / 2 - 100, balY
        );

    }, [config, sim]);

    return <canvas ref={canvasRef} width={380} height={200} className="w-full border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// LP OPTIMIZATION CONSTRAINT BOUNDARY CHART
// ══════════════════════════════════════════════════════════════
function LPConstraintChart({ config, sim }: { config: RefineryConfig; sim: RefinerySimResult }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const W = c.width, H = c.height, M = { l: 50, r: 20, t: 30, b: 35 };
        const pw = W - M.l - M.r, ph = H - M.t - M.b;

        ctx.clearRect(0, 0, W, H);

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(M.l, M.t);
        ctx.lineTo(M.l, M.t + ph);
        ctx.lineTo(W - M.r, M.t + ph);
        ctx.stroke();

        // X: Gasoline yield, Y: Diesel yield (% of crude)
        // Constraints
        const constraints = [
            { x1: 0, y1: 0.42, x2: 0.38, y2: 0, color: '#ef4444', label: 'Octane Spec' },
            { x1: 0, y1: 0.35, x2: 0.45, y2: 0.35, color: '#f59e0b', label: 'Diesel Sulfur' },
            { x1: 0.35, y1: 0, x2: 0.35, y2: 0.40, color: '#3b82f6', label: 'H₂ Balance' },
            { x1: 0, y1: 0.28, x2: 0.5, y2: 0.05, color: '#a855f7', label: 'Cetane Limit' },
            { x1: 0, y1: 0.5, x2: 0.5, y2: 0, color: '#06b6d4', label: 'Capacity' },
        ];

        constraints.forEach(cn => {
            const sx = M.l + cn.x1 * pw;
            const sy = M.t + ph - cn.y1 * ph;
            const ex = M.l + cn.x2 * pw;
            const ey = M.t + ph - cn.y2 * ph;

            ctx.strokeStyle = cn.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;
            ctx.fillStyle = cn.color;
            ctx.font = '8px monospace';
            ctx.fillText(cn.label, mx + 5, my - 5);
        });

        // Feasible region (shaded)
        const feasibleX = 0.22, feasibleY = 0.18;
        const fx = M.l + feasibleX * pw;
        const fy = M.t + ph - feasibleY * ph;

        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
        ctx.beginPath();
        ctx.moveTo(M.l, M.t + ph);
        ctx.lineTo(M.l, M.t + ph * 0.55);
        ctx.lineTo(M.l + pw * 0.15, M.t + ph * 0.58);
        ctx.lineTo(M.l + pw * 0.35, M.t + ph * 0.52);
        ctx.lineTo(M.l + pw * 0.32, M.t + ph * 0.6);
        ctx.lineTo(M.l + pw * 0.15, M.t + ph * 0.65);
        ctx.lineTo(M.l + pw * 0.05, M.t + ph * 0.72);
        ctx.closePath();
        ctx.fill();

        // Optimal point
        ctx.beginPath();
        ctx.arc(fx, fy, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('OPTIMAL', fx + 12, fy - 4);

        // Margin contour lines
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 0.5;
        [-0.1, 0.1, 0.3, 0.5].forEach(off => {
            ctx.setLineDash([2, 6]);
            ctx.beginPath();
            ctx.moveTo(M.l + (0.1 + off) * pw, M.t);
            ctx.lineTo(M.l + off * pw, M.t + ph);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Gasoline Yield (frac of crude)', M.l + pw / 2 - 70, H - 5);
        ctx.save();
        ctx.translate(12, M.t + ph / 2 + 40);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Diesel Yield (frac of crude)', 0, 0);
        ctx.restore();

        // Current operating point
        const opX = 0.22 + (config.fccRiserOutletF - 920) / 2000;
        const opY = 0.18 + (config.hcReactorTempF - 700) / 2000;
        const opPx = M.l + Math.min(0.48, Math.max(0.05, opX)) * pw;
        const opPy = M.t + ph - Math.min(0.48, Math.max(0.05, opY)) * ph;
        ctx.beginPath();
        ctx.arc(opPx, opPy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.font = '8px monospace';
        ctx.fillText('CURRENT', opPx + 8, opPy - 2);

    }, [config, sim]);

    return <canvas ref={canvasRef} width={420} height={260} className="w-full border border-border-subtle rounded bg-[#0a0f1a]" />;
}

// ══════════════════════════════════════════════════════════════
// 6.1 - CRUDE RECEPTION & CHARACTERIZATION
// ══════════════════════════════════════════════════════════════
function CrudeCharacterizationModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const results = useMemo(() => {
        const api = config.crudeApi;
        const sg = sgFromAPI(api);
        const classification = sulfurClass(config.crudeSulfurWtPct);
        const tan = tanClass(config.crudeTan);
        const daysInv = daysOfInventory(30 * config.crudeRateBpd, config.crudeRateBpd);
        // Blend multiple hypothetical crudes
        const blendSG = sgFromAPI(blendApiGravity([
            { api: config.crudeApi, volumeBbl: 0.5 * config.crudeRateBpd },
            { api: config.crudeApi - 3, volumeBbl: 0.3 * config.crudeRateBpd },
            { api: config.crudeApi + 2, volumeBbl: 0.2 * config.crudeRateBpd },
        ]));
        const metalsNiV = config.crudeCCRWtPct * 15 + config.crudeTan * 8;
        const asphaltenes = config.crudeCCRWtPct * config.crudeSulfurWtPct * 2.5;
        return { sg: sg.toFixed(4), api, classification, tan, daysInv, blendSG: blendSG.toFixed(4), metalsNiV: metalsNiV.toFixed(1), asphaltenes: asphaltenes.toFixed(1) };
    }, [config]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.1.1 Crude Oil Receipt" subtitle="Pipeline / Tanker / Rail / Truck" />
                <InputWithSlider label="Crude Throughput" value={config.crudeRateBpd} min={10000} max={800000} step={1000} unit="BPD" source="Basis" onChange={(v: number) => setConfig({ ...config, crudeRateBpd: v })} />
                <InputWithSlider label="Crude API Gravity" value={config.crudeApi} min={10} max={50} step={0.1} unit="°API" source="Measured" onChange={(v: number) => setConfig({ ...config, crudeApi: v })} />
                <InputWithSlider label="Sulfur Content" value={config.crudeSulfurWtPct} min={0.1} max={5.0} step={0.1} unit="WT%" source="Assay" onChange={(v: number) => setConfig({ ...config, crudeSulfurWtPct: v })} />
                <InputWithSlider label="TAN (Total Acid Number)" value={config.crudeTan} min={0.01} max={5.0} step={0.01} unit="mg KOH/g" source="ASTM D664" onChange={(v: number) => setConfig({ ...config, crudeTan: v })} />
                <InputWithSlider label="CCR / MCR" value={config.crudeCCRWtPct} min={0.5} max={35} step={0.1} unit="WT%" source="ASTM D189" onChange={(v: number) => setConfig({ ...config, crudeCCRWtPct: v })} />
                <InputWithSlider label="Crude Cost" value={config.crudeCostPerBbl} min={30} max={150} step={0.5} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, crudeCostPerBbl: v })} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Sp. Gravity" value={results.sg} unit="-" precision={4} source="API→SG" />
                    <DataRow label="Sulfur Class" value={results.classification} unit="-" precision={0} />
                    <DataRow label="TAN Class" value={results.tan} unit="-" precision={0} />
                    <DataRow label="Days Inventory" value={results.daysInv} unit="DAYS" precision={1} />
                    <DataRow label="Blend SG" value={results.blendSG} unit="-" precision={4} source="Multi-crude" />
                    <DataRow label="Ni+V (est)" value={results.metalsNiV} unit="ppm" precision={1} source="CCR×TAN" />
                    <DataRow label="Asphaltenes (est)" value={results.asphaltenes} unit="WT%" precision={1} source="CCR×S" />
                </div>
            </div>
            <div className="col-span-2">
                <SectionHeader title="6.1.2 True Boiling Point (TBP) Assay" subtitle="ASTM D2892 / D5236 — Live Interactive Curve" />
                <AnimatedTBPChart config={config} sim={sim} />
                <div className="mt-2 text-[11px] text-text-secondary text-center">
                    TBP curve shifts with API gravity. Pulsing marker = furnace outlet temperature.
                    Dashed lines = product cut points. All linked to downstream yield calculations.
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.2 - CRUDE DESALTING
// ══════════════════════════════════════════════════════════════
function CrudeDesaltingModule({ config, setConfig }: { config: RefineryConfig; setConfig: (c: RefineryConfig) => void }) {
    const [voltage, setVoltage] = useState(25000);
    const [mixDeltaP, setMixDeltaP] = useState(12);
    const [demulRate, setDemulRate] = useState(15);

    const results = useMemo(() => {
        const efficiency = Math.min(99, 85 + (config.desalterTempF - 110) * 0.3 + (voltage - 15000) / 2000 + (mixDeltaP - 5) * 0.5);
        const outletSalt = multiStageDesalting(config.inletSaltPTB, efficiency, config.desalterStages);
        const washWater = washWaterRate(config.crudeRateBpd, config.washWaterVolPct);
        const saltRemoved = (config.inletSaltPTB - outletSalt) * config.crudeRateBpd * 0.42;
        const brineConc = brineSaltConcentration(washWater, saltRemoved);
        const chemCost = demulsifierCost(demulRate, config.crudeRateBpd, 35);
        const removalEff = saltRemovalEfficiency(config.inletSaltPTB, outletSalt);
        const corrosionRisk = outletSalt > 5 ? 'HIGH - Caustic Required' : outletSalt > 2 ? 'MODERATE' : 'LOW';
        return { outletSalt: outletSalt.toFixed(2), washWater: washWater.toFixed(0), brineConc: brineConc.toFixed(0), chemCost: chemCost.toFixed(0), removalEff: removalEff.toFixed(1), efficiency: efficiency.toFixed(1), corrosionRisk };
    }, [config, voltage, mixDeltaP, demulRate]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <SectionHeader title="6.2 Crude Desalting" subtitle="Salt, water & sediment removal — Electrostatic Coalescence" />
                <InputWithSlider label="Inlet Salt" value={config.inletSaltPTB} min={5} max={500} step={1} unit="PTB" source="Crude assay" onChange={(v: number) => setConfig({ ...config, inletSaltPTB: v })} />
                <InputWithSlider label="Desalter Stages" value={config.desalterStages} min={1} max={3} step={1} unit="STAGES" source="Design" onChange={(v: number) => setConfig({ ...config, desalterStages: v })} />
                <InputWithSlider label="Desalter Temp" value={config.desalterTempF} min={100} max={160} step={1} unit="°F" source="Preheat" onChange={(v: number) => setConfig({ ...config, desalterTempF: v })} />
                <InputWithSlider label="Wash Water" value={config.washWaterVolPct} min={2} max={12} step={0.5} unit="VOL%" source="Operating" onChange={(v: number) => setConfig({ ...config, washWaterVolPct: v })} />
                <InputWithSlider label="Voltage" value={voltage} min={10000} max={35000} step={500} unit="V" source="Electrostatic" onChange={setVoltage} />
                <InputWithSlider label="Mix Valve ΔP" value={mixDeltaP} min={3} max={30} step={0.5} unit="PSI" source="Emulsion" onChange={setMixDeltaP} />
                <InputWithSlider label="Demulsifier Rate" value={demulRate} min={5} max={50} step={1} unit="PPM" source="Chemical" onChange={setDemulRate} />
            </div>
            <div className="space-y-2">
                <SectionHeader title="Desalter Performance" subtitle="Target: <5 PTB, BS&W <0.1%" />
                <DataRow label="Stage Efficiency" value={results.efficiency} unit="%" precision={1} />
                <DataRow label="Outlet Salt" value={results.outletSalt} unit="PTB" precision={2} />
                <DataRow label="Overall Removal" value={results.removalEff} unit="%" precision={1} />
                <DataRow label="Wash Water Rate" value={results.washWater} unit="BPD" precision={0} />
                <DataRow label="Brine Conc." value={results.brineConc} unit="mg/L" precision={0} />
                <DataRow label="Chem. Cost/day" value={results.chemCost} unit="$/DAY" precision={0} />
                <DataRow label="Corrosion Risk" value={results.corrosionRisk} unit="-" precision={0} source="Overhead HCl" />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.3 - CRUDE DISTILLATION
// ══════════════════════════════════════════════════════════════
function CrudeDistillationModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const results = useMemo(() => {
        const duty = furnaceDuty(config.crudeRateBpd, 500, config.furnaceOutletF, config.crudeApi);
        const eff = furnaceEfficiency(450, 10);
        const cduYields = crudeDistillationYields(config.crudeApi, config.furnaceOutletF, config.crudeRateBpd);
        const vduYields = vacuumDistillationYields(cduYields.atmosResidue, config.vduFurnaceOutletF, config.vacuumMmHg);
        const flooding = trayFloodingFactor(2.5, 24);
        const paDuty = pumpAroundDuty(config.crudeRateBpd * 0.4, 60, config.crudeApi);
        const totalCdu = cduYields.lightNaphtha + cduYields.heavyNaphtha + cduYields.kerosene + cduYields.diesel + cduYields.hgo + cduYields.atmosResidue;
        const totalVdu = vduYields.lvgo + vduYields.hvgo + vduYields.vacResidue + vduYields.vacOverhead;
        return { duty: duty.toFixed(1), eff: eff.toFixed(1), cduYields, vduYields, flooding: flooding.toFixed(2), paDuty: paDuty.toFixed(1), totalCdu, totalVdu };
    }, [config]);

    const cduPieData = useMemo(() => [
        { label: 'Light Naphtha', value: results.cduYields.lightNaphtha, color: '#fbbf24' },
        { label: 'Heavy Naphtha', value: results.cduYields.heavyNaphtha, color: '#f59e0b' },
        { label: 'Kerosene', value: results.cduYields.kerosene, color: '#10b981' },
        { label: 'Diesel', value: results.cduYields.diesel, color: '#3b82f6' },
        { label: 'HGO', value: results.cduYields.hgo, color: '#8b5cf6' },
        { label: 'Atm. Residue', value: results.cduYields.atmosResidue, color: '#ef4444' },
    ], [results]);

    const vduPieData = useMemo(() => [
        { label: 'LVGO', value: results.vduYields.lvgo, color: '#06b6d4' },
        { label: 'HVGO', value: results.vduYields.hvgo, color: '#8b5cf6' },
        { label: 'Vac. Residue', value: results.vduYields.vacResidue, color: '#ef4444' },
        { label: 'Overhead', value: results.vduYields.vacOverhead, color: '#94a3b8' },
    ], [results]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.3.1 Atmospheric (CDU)" subtitle="Primary fractionation" />
                <InputWithSlider label="Furnace Outlet Temp" value={config.furnaceOutletF} min={600} max={720} step={1} unit="°F" source="Critical control" onChange={(v: number) => setConfig({ ...config, furnaceOutletF: v })} />
                <InputWithSlider label="Top Pressure" value={config.cduTopPressurePsig} min={5} max={35} step={1} unit="PSIG" source="Operating" onChange={(v: number) => setConfig({ ...config, cduTopPressurePsig: v })} />
                <SectionHeader title="6.3.2 Vacuum (VDU)" subtitle="Deep cut recovery" />
                <InputWithSlider label="VDU Furnace Outlet" value={config.vduFurnaceOutletF} min={730} max={810} step={1} unit="°F" source="Max skin temp" onChange={(v: number) => setConfig({ ...config, vduFurnaceOutletF: v })} />
                <InputWithSlider label="Vacuum Level" value={config.vacuumMmHg} min={15} max={60} step={1} unit="mmHg" source="Tower top" onChange={(v: number) => setConfig({ ...config, vacuumMmHg: v })} />
                <div className="mt-3 space-y-2">
                    <DataRow label="CDU Furnace Duty" value={results.duty} unit="MMBTU/HR" precision={1} />
                    <DataRow label="Furnace Efficiency" value={results.eff} unit="%" precision={1} />
                    <DataRow label="Flooding Factor" value={results.flooding} unit="F/Fmax" precision={2} />
                    <DataRow label="Top PA Duty" value={results.paDuty} unit="MMBTU/HR" precision={1} />
                </div>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                    <YieldPieChart data={cduPieData} title="CDU Yield Distribution" width={240} height={200} />
                    <div className="text-[11px] text-text-secondary text-center mt-1">Total: {fmtBbl(results.totalCdu)}</div>
                </div>
                <div>
                    <YieldPieChart data={vduPieData} title="VDU Yield Distribution" width={240} height={200} />
                    <div className="text-[11px] text-text-secondary text-center mt-1">Total: {fmtBbl(results.totalVdu)}</div>
                </div>
                <div className="col-span-2">
                    <TowerTemperatureProfile config={config} sim={sim} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.4 - NAPHTHA & GASOLINE
// ══════════════════════════════════════════════════════════════
function NaphthaGasolineModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const [ethanolPct, setEthanolPct] = useState(10);
    const [butanePct, setButanePct] = useState(3);
    const [mtbePct, setMtbePct] = useState(0);

    const blendResults = useMemo(() => {
        // Complex multi-component blend calculation
        const components = [
            { name: 'Reformate', ron: sim.reformer.ronAchieved, rvp: 3.5, vol: sim.reformer.reformateBpd },
            { name: 'FCC Naphtha', ron: sim.fcc.gasolineRON, rvp: 5.5, vol: sim.fcc.gasolineBpd * 0.55 },
            { name: 'Isomerate', ron: sim.isomerate, rvp: 12, vol: 14000 },
            { name: 'Alkylate', ron: sim.alkylate.ron, rvp: 4.5, vol: sim.alkylate.alkylateBpd },
            { name: 'LSRN', ron: 65, rvp: 10, vol: sim.cduYields?.lightNaphtha || 18000 },
        ];

        const totalVol = components.reduce((s, c) => s + c.vol, 0);
        const volRON = components.reduce((s, c) => s + c.ron * c.vol, 0) / totalVol;
        const volRVP = components.reduce((s, c) => s + c.rvp * c.vol, 0) / totalVol;

        // Ethanol effect (non-linear octane boost)
        const ethanolRONBoost = ethanolPct * 0.35;
        const ethanolRVP = ethanolPct * 0.18;
        const blendRON = volRON + ethanolRONBoost - butanePct * 0.08 + mtbePct * 0.25;
        const blendMON = blendRON - 8 - ethanolPct * 0.02;
        const blendAKI = (blendRON + blendMON) / 2;
        const blendRVPValue = volRVP + ethanolRVP + butanePct * 0.12 - mtbePct * 0.05;

        return {
            blendRON: blendRON.toFixed(1),
            blendMON: blendMON.toFixed(1),
            blendAKI: blendAKI.toFixed(1),
            blendRVP: blendRVPValue.toFixed(1),
            totalGasoline: (totalVol * (1 + ethanolPct / 100 + butanePct / 100)).toFixed(0),
            grade: blendAKI >= 91 ? 'PREMIUM 91+' : blendAKI >= 89 ? 'MID-GRADE 89' : blendAKI >= 87 ? 'REGULAR 87' : 'SUB-REGULAR',
        };
    }, [config, sim, ethanolPct, butanePct, mtbePct]);

    const reformerData = useMemo(() => [
        { label: 'Reformate', value: sim.reformer.reformateBpd, color: '#eab308' },
        { label: 'LPG', value: sim.reformer.reformateBpd * 0.15, color: '#fbbf24' },
        { label: 'Fuel Gas', value: sim.reformer.reformateBpd * 0.05, color: '#94a3b8' },
        { label: 'H₂ (MMSCFD)', value: sim.reformer.hydrogenMmscfd * 100, color: '#06b6d4' },
    ], [sim]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.4.1 NHT / 6.4.2 Reforming" subtitle="Octane improvement" />
                <div className="flex gap-4 mb-2">
                    <label className="text-[10px] text-industry-label uppercase">Reformer Severity</label>
                    <select className="bg-elevated-bg border border-border-subtle rounded text-[10px] text-industry-value px-2 py-1" value={config.reformerSeverity} onChange={e => setConfig({ ...config, reformerSeverity: e.target.value as any })}>
                        <option value="low">Low (~910°F, 300 psig)</option>
                        <option value="medium">Medium (~940°F, 200 psig)</option>
                        <option value="high">High / CCR (~970°F, 80 psig)</option>
                    </select>
                </div>
                <SectionHeader title="6.4.3 Isomerization" subtitle="C5/C6 upgrading" />
                <InputWithSlider label="Recycle Ratio" value={config.isoRecycleRatio} min={0} max={2.0} step={0.1} unit="x DIH" source="Design" onChange={(v: number) => setConfig({ ...config, isoRecycleRatio: v })} />
                <SectionHeader title="6.4.5 Gasoline Blending" subtitle="Multi-component blend" />
                <InputWithSlider label="Ethanol" value={ethanolPct} min={0} max={15} step={0.5} unit="VOL%" source="E10-E15" onChange={setEthanolPct} />
                <InputWithSlider label="Butane" value={butanePct} min={0} max={10} step={0.5} unit="VOL%" source="RVP trim" onChange={setButanePct} />
                <InputWithSlider label="MTBE" value={mtbePct} min={0} max={15} step={0.5} unit="VOL%" source="Oxygenate" onChange={setMtbePct} />
            </div>
            <div className="col-span-1">
                <SectionHeader title="Component Properties" subtitle="Individual streams" />
                <div className="space-y-2">
                    <DataRow label="Reformate RON" value={sim.reformer.ronAchieved.toFixed(1)} unit="RON" precision={1} />
                    <DataRow label="Reformate H₂" value={sim.reformer.hydrogenMmscfd.toFixed(1)} unit="MMSCFD" precision={1} source="Net producer" />
                    <DataRow label="Benzene" value={sim.reformer.benzenePct.toFixed(1)} unit="VOL%" precision={1} />
                    <DataRow label="Isomerate RON" value={sim.isomerate.toFixed(1)} unit="RON" precision={1} />
                    <DataRow label="Alkylate Yield" value={sim.alkylate.alkylateBpd.toFixed(0)} unit="BPD" precision={0} />
                    <DataRow label="Alkylate RON" value={sim.alkylate.ron.toFixed(1)} unit="RON" precision={1} />
                    <DataRow label="NHT Outlet S" value={sim.nhtSulfur.toFixed(1)} unit="PPM" precision={1} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="Finished Gasoline" subtitle="After blending optimization" />
                <div className="space-y-2">
                    <DataRow label="Blend RON" value={blendResults.blendRON} unit="RON" precision={1} />
                    <DataRow label="Blend MON" value={blendResults.blendMON} unit="MON" precision={1} />
                    <DataRow label="AKI (R+M)/2" value={blendResults.blendAKI} unit="AKI" precision={1} source="Pump octane" />
                    <DataRow label="RVP" value={blendResults.blendRVP} unit="PSI" precision={1} source="Seasonal" />
                    <DataRow label="Grade" value={blendResults.grade} unit="-" precision={0} />
                    <DataRow label="Total Gasoline" value={blendResults.totalGasoline} unit="BPD" precision={0} />
                </div>
                <div className="mt-3">
                    <YieldPieChart data={reformerData} title="Reformer Yield Split" width={220} height={160} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.5 - MIDDLE DISTILLATES
// ══════════════════════════════════════════════════════════════
function MiddleDistillateModule({ config }: { config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult }) {
    const [sulfurPpm, setSulfurPpm] = useState(12000);
    const [dtTemp, setDtTemp] = useState(650);
    const [dtPress, setDtPress] = useState(800);
    const [dtLhsv, setDtLhsv] = useState(1.2);
    const [nitrogenPpm, setNitrogenPpm] = useState(300);
    const [catalystAge, setCatalystAge] = useState(2);
    const [jetAromatics, setJetAromatics] = useState(18);
    const [jetNaphthalenes, setJetNaphthalenes] = useState(2.5);

    const results = useMemo(() => {
        const catDeactivation = 1 - catalystAge * 0.04;
        const sulfur = dieselHdsOutletSulfur(sulfurPpm, dtTemp, dtPress, dtLhsv, nitrogenPpm) * (2 - catDeactivation);
        const cetane = cetaneIndex(845, 220, 275, 340) + (dtTemp - 600) * 0.02;
        const freeze = jetFreezePoint(jetAromatics, 420);
        const smoke = smokePointMM(jetAromatics, jetNaphthalenes);
        const hfrr = hfrrWearScar(sulfur, 25);
        const sulfurCompliant = sulfur < 10;
        const cetaneCompliant = cetane > 51;
        const freezeCompliant = freeze < -47;
        return {
            sulfur: sulfur.toFixed(1), cetane: cetane.toFixed(1), freeze: freeze.toFixed(1),
            smoke: smoke.toFixed(1), hfrr: hfrr.toFixed(0),
            sulfurCompliant, cetaneCompliant, freezeCompliant,
            h2Consumption: ((sulfurPpm - sulfur) / 1000 * 0.12 + nitrogenPpm / 500 * 0.8).toFixed(1),
        };
    }, [sulfurPpm, dtTemp, dtPress, dtLhsv, nitrogenPpm, catalystAge, jetAromatics, jetNaphthalenes]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.5.1 Diesel Hydrotreating" subtitle="ULSD desulfurization" />
                <InputWithSlider label="Feed Sulfur" value={sulfurPpm} min={500} max={30000} step={100} unit="PPM" source="Feed" onChange={setSulfurPpm} />
                <InputWithSlider label="Reactor Temp" value={dtTemp} min={550} max={750} step={5} unit="°F" source="Operating" onChange={setDtTemp} />
                <InputWithSlider label="Pressure" value={dtPress} min={400} max={1500} step={50} unit="PSIG" source="Operating" onChange={setDtPress} />
                <InputWithSlider label="LHSV" value={dtLhsv} min={0.5} max={4.0} step={0.1} unit="HR⁻¹" source="Design" onChange={setDtLhsv} />
                <InputWithSlider label="Feed Nitrogen" value={nitrogenPpm} min={50} max={2000} step={10} unit="PPM" source="Inhibitor" onChange={setNitrogenPpm} />
                <InputWithSlider label="Catalyst Age" value={catalystAge} min={0.5} max={5} step={0.5} unit="YRS" source="Deactivation" onChange={setCatalystAge} />
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.5.2 Jet Fuel Quality" subtitle="Freeze point & smoke point" />
                <InputWithSlider label="Aromatics" value={jetAromatics} min={5} max={35} step={0.5} unit="VOL%" source="ASTM D1319" onChange={setJetAromatics} />
                <InputWithSlider label="Naphthalenes" value={jetNaphthalenes} min={0} max={5} step={0.1} unit="VOL%" source="ASTM D1840" onChange={setJetNaphthalenes} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Freeze Point" value={results.freeze} unit="°C" precision={1} source={results.freezeCompliant ? '✓ PASS' : '✗ FAIL'} />
                    <DataRow label="Smoke Point" value={results.smoke} unit="mm" precision={1} source=">19/25 spec" />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.5.3 Diesel Specs" subtitle="ULSD compliance" />
                <div className="space-y-2">
                    <DataRow label="Product Sulfur" value={results.sulfur} unit="PPM" precision={1} source={results.sulfurCompliant ? '✓ <10 ppm' : '✗ >10 ppm'} />
                    <DataRow label="Cetane Index" value={results.cetane} unit="-" precision={1} source={results.cetaneCompliant ? '✓ >51' : '✗ <51'} />
                    <DataRow label="HFRR Wear Scar" value={results.hfrr} unit="µm" precision={0} source="<460 spec" />
                    <DataRow label="H₂ Consumption" value={results.h2Consumption} unit="SCF/BBL" precision={1} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.6 - CONVERSION PROCESSES
// ══════════════════════════════════════════════════════════════
function ConversionModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const fccPieData = useMemo(() => [
        { label: 'Gasoline', value: sim.fcc.gasolineBpd, color: '#ef4444' },
        { label: 'LCO', value: sim.fcc.lcoBpd, color: '#f59e0b' },
        { label: 'Slurry Oil', value: sim.fcc.slurryBpd, color: '#1e293b' },
        { label: 'LPG', value: sim.fcc.propyleneBpd * 2.5, color: '#3b82f6' },
        { label: 'Coke (wt%)', value: sim.fcc.cokeWtPct * sim.fcc.gasolineBpd * 0.02, color: '#64748b' },
    ], [sim]);

    const hcPieData = useMemo(() => [
        { label: 'Diesel', value: sim.hc.dieselBpd, color: '#22c55e' },
        { label: 'Kerosene', value: sim.hc.keroseneBpd, color: '#06b6d4' },
        { label: 'Naphtha', value: sim.hc.dieselBpd * 0.35, color: '#fbbf24' },
        { label: 'UCO', value: sim.hc.ucoBpd, color: '#475569' },
    ], [sim]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.6.1 FCC" subtitle="Riser-reactor-regenerator" />
                <InputWithSlider label="Riser Outlet" value={config.fccRiserOutletF} min={920} max={1050} step={5} unit="°F" source="Critical control" onChange={(v: number) => setConfig({ ...config, fccRiserOutletF: v })} />
                <InputWithSlider label="Cat-to-Oil Ratio" value={config.fccCatToOilRatio} min={3} max={12} step={0.5} unit="LB/LB" source="Heat balance" onChange={(v: number) => setConfig({ ...config, fccCatToOilRatio: v })} />
                <InputWithSlider label="ZSM-5 Additive" value={config.fccZsm5WtPct} min={0} max={5} step={0.1} unit="WT%" source="Propylene boost" onChange={(v: number) => setConfig({ ...config, fccZsm5WtPct: v })} />
                <div className="mt-2 space-y-1">
                    <DataRow label="Conversion" value={fmtPct(sim.fcc.conversion)} unit="%" precision={1} />
                    <DataRow label="Gasoline RON" value={sim.fcc.gasolineRON.toFixed(1)} unit="RON" precision={1} />
                    <DataRow label="Propylene" value={sim.fcc.propyleneBpd.toFixed(0)} unit="BPD" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.6.2 Hydrocracking" subtitle="High-pressure H₂ cracking" />
                <InputWithSlider label="Reactor Temp" value={config.hcReactorTempF} min={650} max={820} step={5} unit="°F" source="Severity" onChange={(v: number) => setConfig({ ...config, hcReactorTempF: v })} />
                <InputWithSlider label="Pressure" value={config.hcPressurePsig} min={1200} max={3200} step={100} unit="PSIG" source="H₂ partial" onChange={(v: number) => setConfig({ ...config, hcPressurePsig: v })} />
                <select className="bg-elevated-bg border border-border-subtle rounded text-[10px] text-industry-value px-2 py-1 mt-1 w-full" value={config.hcRecycleMode} onChange={e => setConfig({ ...config, hcRecycleMode: e.target.value as any })}>
                    <option value="once-through">Once-Through (40-70% conv.)</option>
                    <option value="recycle">With Recycle (80-99% conv.)</option>
                </select>
                <div className="mt-2 space-y-1">
                    <DataRow label="Conversion" value={fmtPct(sim.hc.conversion)} unit="%" precision={1} />
                    <DataRow label="Diesel Cetane" value={sim.hc.dieselCetane.toFixed(1)} unit="-" precision={1} />
                    <DataRow label="H₂ Consumption" value={sim.hc.h2ConsumptionScfBbl.toFixed(0)} unit="SCF/BBL" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.6.3 Delayed Coking" subtitle="Bottom-of-barrel / 6.6.4 Other" />
                <InputWithSlider label="Drum Temp" value={config.cokerDrumTempF} min={810} max={900} step={5} unit="°F" source="Coking rate" onChange={(v: number) => setConfig({ ...config, cokerDrumTempF: v })} />
                <InputWithSlider label="Drum Pressure" value={config.cokerDrumPressurePsig} min={10} max={80} step={1} unit="PSIG" source="Operating" onChange={(v: number) => setConfig({ ...config, cokerDrumPressurePsig: v })} />
                <div className="mt-2 space-y-1">
                    <DataRow label="Coke Yield" value={fmtPct(sim.coker.cokeWtPct)} unit="WT%" precision={1} />
                    <DataRow label="Liquid Yield" value={fmtPct(sim.coker.liquidYieldPct)} unit="%" precision={1} />
                    <DataRow label="Naphtha" value={fmtBbl(sim.coker.naphthaBpd)} unit="BPD" precision={0} />
                    <DataRow label="LCGO" value={fmtBbl(sim.coker.lcgoBpd)} unit="BPD" precision={0} />
                    <DataRow label="HCGO" value={fmtBbl(sim.coker.hcgoBpd)} unit="BPD" precision={0} />
                </div>
                <div className="mt-2 flex gap-2">
                    <div className="w-1/2"><YieldPieChart data={fccPieData} title="FCC Yields" width={170} height={130} /></div>
                    <div className="w-1/2"><YieldPieChart data={hcPieData} title="HC Yields" width={170} height={130} /></div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.7 - HYDROGEN MANAGEMENT
// ══════════════════════════════════════════════════════════════
function HydrogenManagementModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.7.1 H₂ Production (SMR)" subtitle="Steam methane reforming" />
                <InputWithSlider label="SMR Capacity" value={config.smrCapacityMmscfd} min={5} max={120} step={1} unit="MMSCFD" source="Nat. gas feed" onChange={(v: number) => setConfig({ ...config, smrCapacityMmscfd: v })} />
                <div className="mt-2 space-y-2">
                    <DataRow label="SMR H₂ Prod." value={sim.smr.h2ProductionMmscfd.toFixed(1)} unit="MMSCFD" precision={1} />
                    <DataRow label="SMR Efficiency" value={fmtPct(sim.smr.efficiencyPct)} unit="%" precision={1} />
                    <DataRow label="SMR CO₂" value={sim.smr.co2EmissionsTonPerDay.toFixed(0)} unit="TPD" precision={0} source="Process CO₂" />
                    <DataRow label="Fuel Gas Cons." value={sim.smr.fuelGasConsumedMmscfd.toFixed(1)} unit="MMSCFD" precision={1} />
                    <DataRow label="Reformer H₂" value={sim.reformer.hydrogenMmscfd.toFixed(1)} unit="MMSCFD" precision={1} />
                    <hr className="border-border-subtle" />
                    <DataRow label="Total H₂ Prod." value={sim.h2Prod.toFixed(1)} unit="MMSCFD" precision={1} />
                    <DataRow label="Total H₂ Cons." value={(sim.h2Bal?.totalConsumption || 0).toFixed(1)} unit="MMSCFD" precision={1} />
                    <DataRow label="H₂ Balance" value={(sim.h2Bal?.netBalance || 0).toFixed(1)} unit="MMSCFD" precision={1}
                        source={sim.h2Bal?.deficit ? '⚠ DEFICIT' : '✓ SURPLUS'} />
                </div>
            </div>
            <div className="col-span-2">
                <SectionHeader title="6.7.2 Hydrogen Network & Balance" subtitle="Production ↔ Distribution ↔ Recovery ↔ Consumption" />
                <div className="grid grid-cols-2 gap-3">
                    <HydrogenSankey config={config} sim={sim} />
                    <AnimatedProcessFlow config={config} sim={sim} />
                </div>
                <div className="mt-2 text-[11px] text-text-secondary text-center">
                    Left: H₂ Balance Sankey Diagram | Right: Animated Refinery Process Flow with Live Flow Rates
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.8 - SULFUR & ENVIRONMENTAL
// ══════════════════════════════════════════════════════════════
function SulfurEnvironmentalModule({ config }: { config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult }) {
    const [tgcuEff, setTgcuEff] = useState(95);
    const [scrEfficiency, setScrEff] = useState(90);
    const [wastewaterFlow, setWwFlow] = useState(5000);
    const results = useMemo(() => {
        const totalSulfurBasis = config.crudeRateBpd * config.crudeSulfurWtPct * 0.0035;
        const sr = sulfurToSRU([
            { name: 'CDU OH', h2sFlowLbHr: totalSulfurBasis * 0.08 },
            { name: 'NHT', h2sFlowLbHr: totalSulfurBasis * 0.12 },
            { name: 'DHT', h2sFlowLbHr: totalSulfurBasis * 0.35 },
            { name: 'FCC Gas', h2sFlowLbHr: totalSulfurBasis * 0.25 },
            { name: 'HC Off-gas', h2sFlowLbHr: totalSulfurBasis * 0.10 },
            { name: 'Coker Gas', h2sFlowLbHr: totalSulfurBasis * 0.10 },
        ]);
        const claus = clausEfficiency(3, 80, 0.9);
        const so2 = so2Emissions(claus.tailGasH2SPct, 2, tgcuEff);
        const co2 = refineryCO2Emissions(80, 40, 80000, 30);
        const sulfurRevenue = sr.totalSulfurLtpd * config.sulfurPricePerLt * 365;
        return { sr, claus, so2: so2.toFixed(2), co2, sulfurRevenue };
    }, [tgcuEff, scrEfficiency, config]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.8.1 Amine Treating" subtitle="Multiple unit off-gases" />
                <SectionHeader title="6.8.2 Sour Water Stripping" subtitle="H₂S + NH₃ removal" />
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.8.3 Sulfur Recovery" subtitle="Claus + TGTU" />
                <InputWithSlider label="TGTU Efficiency" value={tgcuEff} min={80} max={99.5} step={0.5} unit="%" source="Design" onChange={setTgcuEff} />
                <InputWithSlider label="SCR Efficiency" value={scrEfficiency} min={70} max={98} step={1} unit="%" source="NOx" onChange={setScrEff} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Sulfur to SRU" value={results.sr.totalSulfurLtpd.toFixed(1)} unit="LT/DAY" precision={1} />
                    <DataRow label="Claus Efficiency" value={results.claus.overallEfficiency.toFixed(1)} unit="%" precision={1} />
                    <DataRow label="SO₂ Emissions" value={results.so2} unit="ST/D" precision={2} />
                    <DataRow label="Sulfur Revenue" value={fmtMoney(results.sulfurRevenue)} unit="$/YR" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.8.4 Emissions" subtitle="Air / Water / Solid Waste" />
                <div className="space-y-2">
                    <DataRow label="Combustion CO₂" value={results.co2.combustionCO2Tpd.toFixed(0)} unit="TPD" precision={0} />
                    <DataRow label="Process CO₂" value={results.co2.processCO2Tpd.toFixed(0)} unit="TPD" precision={0} />
                    <DataRow label="Power CO₂" value={results.co2.powerCO2Tpd.toFixed(0)} unit="TPD" precision={0} />
                    <DataRow label="Total CO₂" value={fmtLarge(results.co2.totalCO2Tpd, 1)} unit="TPD" precision={0} />
                    <DataRow label="Annual CO₂" value={(results.co2.totalCO2Tpd * 365 / 1000).toFixed(1)} unit="KTPY" precision={1} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.9 - LUBE & SPECIALTIES
// ══════════════════════════════════════════════════════════════
function LubeSpecialtiesModule(_props: { config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult }) {
    const [kv40, setKv40] = useState(150);
    const [kv100, setKv100] = useState(14.5);
    const [saturates, setSaturates] = useState(92);
    const [sulfPct, setSulfPct] = useState(0.02);
    const [feedPour, setFeedPour] = useState(80);
    const [targetPour, setTargetPour] = useState(-5);
    const [penetration, setPenetration] = useState(150);
    const [airRate, setAirRate] = useState(500);

    const results = useMemo(() => {
        const vi = viscosityIndex(kv40, kv100);
        const group = baseOilGroup(saturates, sulfPct, vi);
        const wax = solventDewaxing(5000, feedPour, targetPour, 3);
        const asphalt = airBlownAsphalt(penetration, airRate, 480, 8);
        const blend = asphaltBlendIndex([
            { volPct: 60, penetration: penetration },
            { volPct: 40, penetration: 50 },
        ]);
        return { vi: vi.toFixed(0), group, wax, asphalt, blend: blend.toFixed(0) };
    }, [kv40, kv100, saturates, sulfPct, feedPour, targetPour, penetration, airRate]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.9.1 Lube Base Oil" subtitle="VI, Group classification, dewaxing" />
                <InputWithSlider label="KV40" value={kv40} min={20} max={500} step={1} unit="cSt" source="ASTM D445" onChange={setKv40} />
                <InputWithSlider label="KV100" value={kv100} min={2} max={50} step={0.1} unit="cSt" source="ASTM D445" onChange={setKv100} />
                <InputWithSlider label="Saturates" value={saturates} min={50} max={99} step={0.5} unit="%" source="ASTM D2007" onChange={setSaturates} />
                <InputWithSlider label="Sulfur" value={sulfPct} min={0.001} max={0.5} step={0.001} unit="%" source="ASTM D2622" onChange={setSulfPct} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Viscosity Index" value={results.vi} unit="VI" precision={0} />
                    <DataRow label="Base Oil Group" value={results.group} unit="-" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.9.2 Wax Processing" subtitle="Dewaxing & deoiling" />
                <InputWithSlider label="Feed Pour Point" value={feedPour} min={30} max={140} step={1} unit="°F" source="Wax crude" onChange={setFeedPour} />
                <InputWithSlider label="Target Pour Point" value={targetPour} min={-40} max={40} step={1} unit="°F" source="Spec" onChange={setTargetPour} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Wax Yield" value={results.wax.waxYieldWtPct.toFixed(1)} unit="WT%" precision={1} />
                    <DataRow label="Dewaxed Oil" value={results.wax.dewaxedOilBpd.toFixed(0)} unit="BPD" precision={0} />
                    <DataRow label="Wax Product" value={results.wax.waxProductBpd.toFixed(0)} unit="BPD" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.9.3 Asphalt / 6.9.4 Petrochemical" subtitle="Penetration grade & specialties" />
                <InputWithSlider label="Penetration" value={penetration} min={10} max={300} step={1} unit="0.1mm" source="Feed" onChange={setPenetration} />
                <InputWithSlider label="Air Rate" value={airRate} min={100} max={1500} step={10} unit="SCFM" source="Blowing" onChange={setAirRate} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Asphalt Pen." value={results.asphalt.productPenetration.toFixed(1)} unit="0.1mm" precision={1} />
                    <DataRow label="Softening Pt." value={results.asphalt.softeningPointF.toFixed(0)} unit="°F" precision={0} />
                    <DataRow label="Blend Pen." value={results.blend} unit="0.1mm" precision={0} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.10 - UTILITIES & ENERGY
// ══════════════════════════════════════════════════════════════
function RefineryUtilitiesModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const utilResults = useMemo(() => {
        const be = boilerEfficiency(350, 3);
        const ct = coolingTowerEvaporation(80000, 15, 5);
        const chp = gasTurbineCHP(50, 35, 80);
        const eii = energyIntensityIndex(9000, config.crudeRateBpd, 8);
        const steamTurbPwr = steamTurbinePower(120000, 600, 50, 0.82);
        const wasteHt = wasteHeatSteam(350, 80000, 0.7);
        return { be: be.toFixed(1), ct, chp, eii: eii.toFixed(1), steamTurbPwr: steamTurbPwr.toFixed(1), wasteHt: wasteHt.toFixed(0) };
    }, [config]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.10.1 Steam System" subtitle="Boilers, HRSG, cogeneration" />
                <InputWithSlider label="Power Cost" value={config.powerCostPerMWh} min={20} max={200} step={1} unit="$/MWH" source="Grid" onChange={(v: number) => setConfig({ ...config, powerCostPerMWh: v })} />
                <InputWithSlider label="Fuel Gas Cost" value={config.fuelGasCostPerMMBtu} min={1} max={15} step={0.5} unit="$/MMBTU" source="Market" onChange={(v: number) => setConfig({ ...config, fuelGasCostPerMMBtu: v })} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Steam Turbine Pwr" value={utilResults.steamTurbPwr} unit="MW" precision={1} />
                    <DataRow label="Waste Heat Steam" value={utilResults.wasteHt} unit="LB/HR" precision={0} />
                    <DataRow label="Boiler Efficiency" value={utilResults.be} unit="%" precision={1} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.10.2 Cooling Water" subtitle="Recirculating system" />
                <SectionHeader title="6.10.3 Electrical" subtitle="Power distribution" />
                <div className="space-y-2">
                    <DataRow label="CT Evaporation" value={utilResults.ct.evaporationGpm.toFixed(0)} unit="GPM" precision={0} />
                    <DataRow label="CT Blowdown" value={utilResults.ct.blowdownGpm.toFixed(0)} unit="GPM" precision={0} />
                    <DataRow label="CT Makeup" value={utilResults.ct.makeupGpm.toFixed(0)} unit="GPM" precision={0} />
                </div>
            </div>
            <div className="col-span-1">
                <SectionHeader title="6.10.4 Energy Efficiency" subtitle="Solomon EII & optimization" />
                <div className="space-y-2">
                    <DataRow label="CHP Fuel Input" value={utilResults.chp.fuelInputMMBtuHr.toFixed(1)} unit="MMBTU/HR" precision={1} />
                    <DataRow label="Steam Generated" value={(utilResults.chp.steamGeneratedLbHr / 1000).toFixed(1)} unit="KLB/HR" precision={1} />
                    <DataRow label="Overall Eff." value={utilResults.chp.overallEfficiencyPct.toFixed(1)} unit="%" precision={1} />
                    <hr className="border-border-subtle" />
                    <DataRow label="EII (Solomon)" value={utilResults.eii} unit="INDEX" precision={1} source="Target <100" />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.11 - ECONOMICS & PLANNING
// ══════════════════════════════════════════════════════════════
function RefineryEconomicsModule({ config, setConfig, sim }: {
    config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult;
}) {
    const opex = useMemo(() => unitOPEX(2.5, 0.8, 1.2, 0.5, 0.5), []);
    const turn = useMemo(() => turnaroundEconomics(config.crudeRateBpd, sim.margin.marginPerBbl, 30, 75, 3), [config, sim]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.11.1 LP Planning" subtitle="Margin maximization" />
                <InputWithSlider label="Gasoline Price" value={config.gasolinePricePerBbl} min={50} max={200} step={1} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, gasolinePricePerBbl: v })} />
                <InputWithSlider label="Diesel Price" value={config.dieselPricePerBbl} min={50} max={200} step={1} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, dieselPricePerBbl: v })} />
                <InputWithSlider label="Jet Fuel Price" value={config.jetPricePerBbl} min={50} max={200} step={1} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, jetPricePerBbl: v })} />
                <InputWithSlider label="LPG Price" value={config.lpgPricePerBbl} min={20} max={100} step={1} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, lpgPricePerBbl: v })} />
                <InputWithSlider label="Fuel Oil Price" value={config.fuelOilPricePerBbl} min={30} max={120} step={1} unit="$/BBL" source="Market" onChange={(v: number) => setConfig({ ...config, fuelOilPricePerBbl: v })} />
                <InputWithSlider label="Coke Price" value={config.cokePricePerTon} min={20} max={150} step={1} unit="$/TON" source="Market" onChange={(v: number) => setConfig({ ...config, cokePricePerTon: v })} />
                <InputWithSlider label="Sulfur Price" value={config.sulfurPricePerLt} min={20} max={250} step={5} unit="$/LT" source="Market" onChange={(v: number) => setConfig({ ...config, sulfurPricePerLt: v })} />
            </div>
            <div className="col-span-2">
                <SectionHeader title="6.11.2 Performance Metrics & 6.11.3 Economics" subtitle="Full-year financial results" />
                <EconomicWaterfall config={config} sim={sim} />
                <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                        <SectionHeader title="Margin Summary" subtitle="" />
                        <div className="space-y-1">
                            <DataRow label="Total Revenue" value={fmtMoney(sim.margin.totalRevenue)} unit="$" precision={0} />
                            <DataRow label="Crude Cost" value={fmtMoney(sim.margin.totalCrudeCost)} unit="$" precision={0} />
                            <DataRow label="OpEx" value={fmtMoney(sim.margin.totalOpCost)} unit="$" precision={0} />
                            <DataRow label="Gross Margin" value={fmtMoney(sim.margin.grossMargin)} unit="$" precision={0} />
                            <DataRow label="Margin/bbl" value={'$' + sim.margin.marginPerBbl.toFixed(2)} unit="$/BBL" precision={2} />
                        </div>
                    </div>
                    <div>
                        <SectionHeader title="Benchmarking" subtitle="" />
                        <div className="space-y-1">
                            <DataRow label="3-2-1 Crack" value={'$' + sim.crack3_2_1.toFixed(2)} unit="$/BBL" precision={2} />
                            <DataRow label="Nelson C.I." value={sim.nci.toFixed(1)} unit="NCI" precision={1} />
                            <DataRow label="Total Products" value={fmtBbl(sim.totalProducts)} unit="BPD" precision={0} />
                            <DataRow label="OPEX/bbl" value={'$' + opex.totalOPEXPerBbl.toFixed(2)} unit="$/BBL" precision={2} />
                            <DataRow label="Energy %" value={opex.breakdown.energy.toFixed(0)} unit="%" precision={0} />
                        </div>
                    </div>
                    <div>
                        <SectionHeader title="Turnaround" subtitle="" />
                        <div className="space-y-1">
                            <DataRow label="Loss Revenue" value={fmtMoney(turn.revenueLostMM * 1e6)} unit="$" precision={0} />
                            <DataRow label="Annualized Cost" value={fmtMoney(turn.annualizedTurnaroundCostMM * 1e6)} unit="$/YR" precision={0} />
                            <DataRow label="Optimal Run" value={turn.optimalRunLengthYears.toFixed(1)} unit="YEARS" precision={1} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// 6.12 - PRODUCT STORAGE & DISPATCH
// ══════════════════════════════════════════════════════════════
function ProductStorageDispatchModule(_props: { config: RefineryConfig; setConfig: (c: RefineryConfig) => void; sim: RefinerySimResult }) {
    const [tankCap, setTankCap] = useState(500000);
    const [inventory, setInventory] = useState(350000);
    const [numLanes, setNumLanes] = useState(4);
    const [gpmLane, setGpmLane] = useState(500);
    const [loadTime, setLoadTime] = useState(35);
    const [switchTime, setSwitchTime] = useState(10);
    const [operHrs, setOperHrs] = useState(18);
    const [utilPct, setUtilPct] = useState(85);

    const results = useMemo(() => {
        const tank = tankUllage(tankCap, inventory);
        const truck = truckRackThroughput(numLanes, gpmLane, loadTime, switchTime, operHrs, utilPct);
        const pipe = pipelineBatchInterface(24, 300, 8);
        const marine = marineLoadingRate(500000, 3000, 3, 2);
        const additive = additiveInjection(80000, 150);
        return { tank, truck, pipe, marine, additive };
    }, [tankCap, inventory, numLanes, gpmLane, loadTime, switchTime, operHrs, utilPct]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <SectionHeader title="6.12.1 Product Tank Farm" subtitle="Segregated storage & certification" />
                <InputWithSlider label="Tank Capacity" value={tankCap} min={50000} max={2000000} step={10000} unit="BBL" source="Design" onChange={setTankCap} />
                <InputWithSlider label="Current Inventory" value={inventory} min={0} max={2000000} step={10000} unit="BBL" source="Operating" onChange={setInventory} />
                <div className="mt-3 space-y-2">
                    <DataRow label="Ullage" value={fmtLarge(results.tank.ullageBbl, 0)} unit="BBL" precision={0} />
                    <DataRow label="Utilization" value={fmtPct(results.tank.utilizationPct)} unit="%" precision={1} />
                </div>
                <SectionHeader title="6.12.2 Blending" subtitle="In-line & additive injection" />
                <div className="space-y-2">
                    <DataRow label="Additive Rate" value={results.additive.injectionRateGalHr.toFixed(2)} unit="GAL/HR" precision={2} />
                    <DataRow label="Daily Additive" value={results.additive.dailyConsumptionGal.toFixed(1)} unit="GAL/DAY" precision={1} />
                    <DataRow label="Annual Cost" value={fmtMoney(results.additive.annualCost)} unit="$/YR" precision={0} />
                </div>
            </div>
            <div className="col-span-2">
                <SectionHeader title="6.12.3 Dispatch Operations" subtitle="Pipeline / Marine / Rail / Truck Loading" />
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <div className="text-[10px] text-brand-primary font-bold uppercase mb-1">Truck Rack</div>
                        <InputWithSlider label="Lanes" value={numLanes} min={1} max={12} step={1} unit="LANES" source="Rack" onChange={setNumLanes} />
                        <InputWithSlider label="Flow/Lane" value={gpmLane} min={200} max={800} step={10} unit="GPM" source="Design" onChange={setGpmLane} />
                        <InputWithSlider label="Load Time" value={loadTime} min={15} max={60} step={1} unit="MIN" source="Fill" onChange={setLoadTime} />
                        <InputWithSlider label="Switch Time" value={switchTime} min={5} max={20} step={1} unit="MIN" source="Change" onChange={setSwitchTime} />
                        <InputWithSlider label="Op. Hours" value={operHrs} min={8} max={24} step={1} unit="HR/DAY" source="Schedule" onChange={setOperHrs} />
                        <InputWithSlider label="Utilization" value={utilPct} min={50} max={98} step={1} unit="%" source="Ops" onChange={setUtilPct} />
                    </div>
                    <div>
                        <div className="text-[10px] text-brand-primary font-bold uppercase mb-1">Truck Metrics</div>
                        <div className="space-y-2">
                            <DataRow label="Trucks/Day" value={results.truck.trucksPerDay} unit="TRUCKS" precision={0} />
                            <DataRow label="Throughput" value={fmtBbl(results.truck.throughputBpd)} unit="BPD" precision={0} />
                        </div>
                        <div className="text-[10px] text-brand-primary font-bold uppercase mt-3 mb-1">Pipeline</div>
                        <div className="space-y-2">
                            <DataRow label="Interface" value={results.pipe.interfaceVolumeBbl.toFixed(0)} unit="BBL/MO" precision={0} />
                            <DataRow label="Downgrade Cost" value={fmtMoney(results.pipe.downgradeCostPerMonth * 12)} unit="$/YR" precision={0} />
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-brand-primary font-bold uppercase mb-1">Marine</div>
                        <div className="space-y-2">
                            <DataRow label="Load Time" value={results.marine.totalLoadingTimeHr.toFixed(1)} unit="HR" precision={1} />
                            <DataRow label="Loading Rate" value={results.marine.effectiveRateBph.toFixed(0)} unit="BPH" precision={0} />
                        </div>
                        <div className="text-[10px] text-brand-primary font-bold uppercase mt-3 mb-1">LP Optimization</div>
                        <LPConstraintChart config={{ ..._props.config }} sim={_props.sim} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// MAIN STAGE CONTAINER
// ══════════════════════════════════════════════════════════════
const tabs = [
    { key: '6.1', label: '6.1 Crude Reception & Assay' },
    { key: '6.2', label: '6.2 Desalting' },
    { key: '6.3', label: '6.3 Crude Distillation' },
    { key: '6.4', label: '6.4 Naphtha & Gasoline' },
    { key: '6.5', label: '6.5 Middle Distillates' },
    { key: '6.6', label: '6.6 Conversion (FCC/HC/Coker)' },
    { key: '6.7', label: '6.7 Hydrogen Management' },
    { key: '6.8', label: '6.8 Sulfur & Environmental' },
    { key: '6.9', label: '6.9 Lube & Specialties' },
    { key: '6.10', label: '6.10 Utilities & Energy' },
    { key: '6.11', label: '6.11 Economics & Planning' },
    { key: '6.12', label: '6.12 Storage & Dispatch' },
];

export default function RefiningStage() {
    const [config, setConfig] = useState<RefineryConfig>(defaultConfig);
    const [activeTab, setActiveTab] = useState('6.1');
    const [initialized, setInitialized] = useState(false);

    // ── Store hooks ──
    const midstream = useMidstream();
    const production = useProduction();
    const refining = useRefining();
    const { setLayerDirty } = useStoreActions();

    // ── Load sample data ──
    const handleLoadRefiningSample = useCallback(() => {
        const s = getRefiningSample();
        // Map the crude assay sample to refinery config fields
        // The sample provides crude characterization — other fields retain sensible defaults
        setConfig(prev => ({
            ...prev,
            // Core crude properties from the assay
            crudeRateBpd: 250000, // Typical mid-size refinery
            crudeApi: s.apiGravity,
            crudeSulfurWtPct: s.sulfurWtPct,
            crudeTan: s.tanMgKoh,
            crudeCCRWtPct: s.fractionProperties.vacuumResid.concarbonWtPct,
            crudeCostPerBbl: 78, // Market price for medium sour
            // Desalter defaults for medium sour crude
            desalterStages: 2,
            desalterTempF: 135,
            washWaterVolPct: 6,
            inletSaltPTB: s.saltLbPer1000Bbl,
            // Distillation — tuned for medium sour
            furnaceOutletF: 670,
            cduTopPressurePsig: 20,
            vduFurnaceOutletF: 780,
            vacuumMmHg: 30,
            // Naphtha / reforming
            reformerSeverity: 'medium' as const,
            isoRecycleRatio: 0.5,
            // FCC — moderate severity
            fccRiserOutletF: 995,
            fccCatToOilRatio: 7,
            fccZsm5WtPct: 1.0,
            // Hydrocracker — medium pressure
            hcReactorTempF: 740,
            hcPressurePsig: 2400,
            hcRecycleMode: 'once-through' as const,
            // Coker
            cokerDrumTempF: 860,
            cokerDrumPressurePsig: 30,
            // Utilities
            smrCapacityMmscfd: 40,
            powerCostPerMWh: 55,
            fuelGasCostPerMMBtu: 4.5,
            // Product pricing (market-typical)
            gasolinePricePerBbl: 115,
            dieselPricePerBbl: 125,
            jetPricePerBbl: 122,
            fuelOilPricePerBbl: 72,
            lpgPricePerBbl: 52,
            cokePricePerTon: 85,
            sulfurPricePerLt: 95,
        }));
    }, []);

    // ── Seed config from midstream data on first mount ──
    useEffect(() => {
        if (initialized || !midstream) return;
        // If pipeline throughput is set, use it as the refinery crude rate
        const msThroughput = midstream.data?.pipeline?.currentThroughput ?? 0;
        if (msThroughput > 0) {
            setConfig(prev => ({
                ...prev,
                crudeRateBpd: msThroughput,
            }));
            setInitialized(true);
        }
    }, [midstream, initialized]);

    // Central simulation run — changes to any config parameter cascade through ALL calculations
    const sim = useMemo(() => runRefinerySimulation(config), [config]);

    const simData = sim;
    // ── Persist completed simulation results to the refining layer ──
    useEffect(() => {
        if (!simData || !simData.margin || !refining) return;
        refining.update({
            totalThroughput: config.crudeRateBpd,
            utilizationRate: (config.crudeRateBpd / 250000) * 100,
            crudeSlate: [{
                name: 'Primary Blend',
                volume: config.crudeRateBpd,
                api: config.crudeApi,
                sulfur: config.crudeSulfurWtPct,
                tan: config.crudeTan,
                price: config.crudeCostPerBbl,
            }],
            units: [],
            products: [
                { name: 'Regular Gasoline', volume: (simData.cduYields?.lightNaphtha || 0) + (simData.reformer?.reformateBpd || 0) * 0.4, quality: { octane: simData.reformer?.ronAchieved || 91, sulfur: 10, rvp: 9 }, specCompliance: true, price: config.gasolinePricePerBbl, revenue: 0 },
                { name: 'Premium Gasoline', volume: (simData.reformer?.reformateBpd || 0) * 0.6, quality: { octane: simData.reformer?.ronAchieved || 95, sulfur: 10, rvp: 9 }, specCompliance: true, price: config.gasolinePricePerBbl * 1.08, revenue: 0 },
                { name: 'ULSD', volume: simData.cduYields?.diesel || 0, quality: { cetane: 52, sulfur: 10, rvp: undefined }, specCompliance: true, price: config.dieselPricePerBbl, revenue: 0 },
                { name: 'Jet A-1', volume: simData.cduYields?.kerosene || 0, quality: { freezePoint: -47, smokePoint: 25, sulfur: 5 }, specCompliance: true, price: config.jetPricePerBbl, revenue: 0 },
                { name: 'Fuel Oil', volume: simData.cduYields?.atmosResidue || 0, quality: { sulfur: config.crudeSulfurWtPct * 2 }, specCompliance: true, price: config.fuelOilPricePerBbl, revenue: 0 },
                { name: 'LPG', volume: simData.fcc?.propyleneBpd || 0, quality: { rvp: 208 }, specCompliance: true, price: config.lpgPricePerBbl, revenue: 0 },
                { name: 'Coke', volume: simData.coker?.cokeWtPct || 0, quality: { sulfur: config.crudeSulfurWtPct * 3 }, specCompliance: true, price: config.cokePricePerTon, revenue: 0 },
                { name: 'Sulfur', volume: config.crudeSulfurWtPct * config.crudeRateBpd * 0.000035, quality: { purity: 99.9 }, specCompliance: true, price: config.sulfurPricePerLt, revenue: 0 },
            ],
            economics: {
                grossMargin: simData.margin?.marginPerBbl || 0,
                opex: 2.5,
                netMargin: (simData.margin?.marginPerBbl || 0) - 2.5,
                crackSpread: simData.crack3_2_1 || 0,
                hydrogenBalance: simData.h2Bal?.netBalance || 0,
                sulfurProduction: config.crudeSulfurWtPct * config.crudeRateBpd * 0.000035 * 0.907,
            },
        });
        setLayerDirty('refining');
    }, [simData, config.crudeRateBpd]);

    const renderTab = () => {
        switch (activeTab) {
            case '6.1': return <CrudeCharacterizationModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.2': return <CrudeDesaltingModule config={config} setConfig={setConfig} />;
            case '6.3': return <CrudeDistillationModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.4': return <NaphthaGasolineModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.5': return <MiddleDistillateModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.6': return <ConversionModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.7': return <HydrogenManagementModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.8': return <SulfurEnvironmentalModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.9': return <LubeSpecialtiesModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.10': return <RefineryUtilitiesModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.11': return <RefineryEconomicsModule config={config} setConfig={setConfig} sim={sim} />;
            case '6.12': return <ProductStorageDispatchModule config={config} setConfig={setConfig} sim={sim} />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-app-bg text-text-primary">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-elevated-bg shrink-0">
                <div>
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Phase 6: Refining (Downstream)</h2>
                    <p className="text-[10px] text-text-secondary uppercase">
                        Crude processing • Conversion • Product blending • Economics — {fmtBbl(config.crudeRateBpd)} {sim.margin ? `| Marg: $${sim.margin.marginPerBbl.toFixed(2)}/bbl` : ''}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <SampleDataLoader
                        label="Load Medium Sour Crude Assay"
                        stageName="Refining"
                        loadSample={handleLoadRefiningSample}
                    />
                    <div className="text-right">
                        <span className="text-[10px] text-text-secondary uppercase block">Crude Rate | Margin</span>
                        <span className="text-lg font-bold text-brand-primary data-mono">{config.crudeRateBpd.toLocaleString()} BPD</span>
                        <span className="text-sm font-bold text-emerald-400 data-mono block">
                            ${sim.margin?.marginPerBbl?.toFixed(2) || '0.00'}/bbl
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex px-1 pt-1 bg-elevated-bg border-b border-border-subtle shrink-0 overflow-x-auto gap-0.5">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`whitespace-nowrap px-2.5 py-1.5 text-[10px] font-medium uppercase rounded-t transition-colors ${activeTab === t.key
                            ? 'bg-app-bg text-brand-primary border-t border-x border-border-subtle'
                            : 'text-text-secondary hover:text-text-primary hover:bg-app-bg/50'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-4">
                {renderTab()}
            </div>
        </div>
    );
}
